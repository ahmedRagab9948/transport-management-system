'use client';

import { memo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import dynamic from 'next/dynamic';
import { ConfirmDialog, DeleteEntityDialog } from '@/components/shared';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { useDeleteTrip, useUpdateTripStatus } from '../hooks/use-trips';
import type { TripStatus } from '../types/trip.types';
import { getAvailableActions, LIFECYCLE_ACTIONS } from '../constants/trip-lifecycle';
import type { TripActionType } from '../constants/trip-lifecycle';
import { UserCheck, Play, Clock, CheckCircle2, XCircle } from 'lucide-react';

const AssignTripDialog = dynamic(() => import('./assign-trip-dialog').then(m => m.AssignTripDialog), { ssr: false, loading: () => null });
const StartTripDialog = dynamic(() => import('./start-trip-dialog').then(m => m.StartTripDialog), { ssr: false, loading: () => null });
const CompleteTripDialog = dynamic(() => import('./complete-trip-dialog').then(m => m.CompleteTripDialog), { ssr: false, loading: () => null });
const CancelTripDialog = dynamic(() => import('./cancel-trip-dialog').then(m => m.CancelTripDialog), { ssr: false, loading: () => null });
const ConflictWarningDialog = dynamic(() => import('./conflict-warning-dialog').then(m => m.ConflictWarningDialog), { ssr: false, loading: () => null });

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck, Play, Clock, CheckCircle2, XCircle,
};

interface TripActionsProps {
  trip: {
    id: string;
    status: TripStatus;
    tripNumber: string;
    vehicle?: { vehicleCode: string } | null;
    driver?: { fullName: string } | null;
  };
}

const VALID_TRANSITIONS: Record<TripStatus, TripStatus[]> = LIFECYCLE_ACTIONS.reduce(
  (map, action) => {
    for (const from of action.fromStatuses) {
      if (!map[from]) map[from] = [];
      const to = action.resolveTarget(from);
      if (!map[from].includes(to)) map[from].push(to);
    }
    return map;
  },
  {} as Record<TripStatus, TripStatus[]>,
);
VALID_TRANSITIONS['COMPLETED'] = [];
VALID_TRANSITIONS['CANCELLED'] = [];

export const TripActions = memo(function TripActions({ trip }: TripActionsProps) {
  const router = useRouter();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const deleteMutation = useDeleteTrip();
  const statusMutation = useUpdateTripStatus();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dialogType, setDialogType] = useState<TripActionType | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [conflictWarnings, setConflictWarnings] = useState<any[]>([]);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const canView = hasPermission(PERMISSIONS.VIEW_TRIPS);
  const canEdit = hasPermission(PERMISSIONS.UPDATE_TRIP);
  const canDelete = hasPermission(PERMISSIONS.DELETE_TRIP) && trip.status === 'PENDING';

  const availableActions = getAvailableActions(trip.status, canEdit, hasPermission);

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setConflictWarnings([]);
    setPendingAction(null);
  }, []);

  async function handleStatusChange(data: { notes?: string; reasonCode?: string; actualEndDate?: string }) {
    const newStatus = resolvedTargetStatus();
    const allowed = VALID_TRANSITIONS[trip.status];
    if (!allowed.includes(newStatus)) return;

    try {
      const result = await statusMutation.mutateAsync({
        id: trip.id,
        status: newStatus,
        notes: data.notes,
        reasonCode: data.reasonCode,
        actualEndDate: data.actualEndDate,
      });

      if (result.warnings && result.warnings.length > 0) {
        setConflictWarnings(result.warnings);
        setPendingAction(null);
        return;
      }

      closeDialog();
    } catch (err: any) {
      const msg = err?.message || '';
      const warnings = err?.warnings;
      if (warnings && warnings.length > 0) {
        setConflictWarnings(warnings);
        setPendingAction(null);
      }
    }
  }

  function resolvedTargetStatus(): TripStatus {
    if (!dialogType) return 'PENDING';
    const def = LIFECYCLE_ACTIONS.find((a) => a.type === dialogType);
    return def ? def.resolveTarget(trip.status) : 'PENDING';
  }

  function handleDelete() {
    return deleteMutation.mutateAsync(trip.id);
  }

  function actionIcon(actionType: TripActionType): React.ReactNode {
    const def = LIFECYCLE_ACTIONS.find((a) => a.type === actionType);
    if (!def) return null;
    const IconComp = ICON_MAP[def.icon];
    return IconComp ? <IconComp className="size-4" /> : null;
  }

  function actionLabel(actionType: TripActionType): string {
    const def = LIFECYCLE_ACTIONS.find((a) => a.type === actionType);
    return def ? t(`${def.i18nKey}`) : '';
  }

  function actionTooltip(actionType: TripActionType): string {
    const key = `${LIFECYCLE_ACTIONS.find((a) => a.type === actionType)?.i18nKey}_tooltip`;
    const val = t(key);
    return val !== key ? val : actionLabel(actionType);
  }

  const lifecycleButtons = availableActions.map((action) => (
    <Tooltip key={action.type}>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setDialogType(action.type)}
            aria-label={actionLabel(action.type)}
          >
            {actionIcon(action.type)}
          </Button>
        }
      />
      <TooltipContent>{actionTooltip(action.type)}</TooltipContent>
    </Tooltip>
  ));

  function lifecycleDialog(actionType: TripActionType | null) {
    if (!actionType) return null;

    switch (actionType) {
      case 'assign':
        return (
          <AssignTripDialog
            open={dialogType === 'assign'}
            onOpenChange={(v) => { if (!v) closeDialog(); }}
            onConfirm={(notes) => handleStatusChange({ notes })}
            isLoading={statusMutation.isPending}
          />
        );
      case 'cancel':
        return (
          <CancelTripDialog
            open={dialogType === 'cancel'}
            onOpenChange={(v) => { if (!v) closeDialog(); }}
            onConfirm={(data) => handleStatusChange(data)}
            isLoading={statusMutation.isPending}
          />
        );
      case 'complete':
        return (
          <CompleteTripDialog
            open={dialogType === 'complete'}
            onOpenChange={(v) => { if (!v) closeDialog(); }}
            onConfirm={(data) => handleStatusChange(data)}
            isLoading={statusMutation.isPending}
          />
        );
      default: {
        const def = LIFECYCLE_ACTIONS.find((a) => a.type === actionType);
        const isStartLike = def && !['assign', 'complete', 'cancel'].includes(actionType);
        if (isStartLike) {
          return (
            <StartTripDialog
              open={dialogType === actionType}
              onOpenChange={(v) => { if (!v) closeDialog(); }}
              onConfirm={(notes) => handleStatusChange({ notes })}
              isLoading={statusMutation.isPending}
              vehicleCode={trip.vehicle?.vehicleCode}
              driverName={trip.driver?.fullName}
              i18nPrefix={def.i18nKey}
              confirmLabel={t('common.confirm')}
            />
          );
        }
        return null;
      }
    }
  }

  return (
    <>
      <div className="flex items-center justify-center gap-0.5">
        {canView ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => router.push(ROUTES.tripsDetail(trip.id))}
                  aria-label={t('common.view')}
                >
                  <Eye className="size-4" />
                </Button>
              }
            />
            <TooltipContent>{t('common.view')}</TooltipContent>
          </Tooltip>
        ) : null}

        {canEdit ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    const activeStatuses: TripStatus[] = ['ASSIGNED', 'DRIVER_CONFIRMED', 'LOADING', 'ON_ROUTE', 'WAITING', 'UNLOADING'];
                    if (activeStatuses.includes(trip.status)) {
                      setShowEditConfirm(true);
                    } else {
                      router.push(ROUTES.tripsEdit(trip.id));
                    }
                  }}
                  aria-label={t('common.edit')}
                >
                  <Edit className="size-4" />
                </Button>
              }
            />
            <TooltipContent>{t('common.edit')}</TooltipContent>
          </Tooltip>
        ) : null}

        {lifecycleButtons}

        {canDelete ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteOpen(true)}
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="size-4 text-destructive/70" />
                </Button>
              }
            />
            <TooltipContent>{t('common.delete')}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {lifecycleDialog(dialogType)}

      <ConflictWarningDialog
        open={conflictWarnings.length > 0}
        onOpenChange={(v) => { if (!v) { setConflictWarnings([]); } }}
        warnings={conflictWarnings}
        onContinue={() => {
          if (pendingAction) pendingAction();
          closeDialog();
        }}
        onEditDates={closeDialog}
        isLoading={statusMutation.isPending}
      />

      <ConfirmDialog
        open={showEditConfirm}
        onOpenChange={setShowEditConfirm}
        title={t('trips.edit_active_trip_title')}
        description={t('trips.edit_active_trip_description')}
        confirmLabel={t('common.edit')}
        onConfirm={() => {
          setShowEditConfirm(false);
          router.push(ROUTES.tripsEdit(trip.id));
        }}
      />

      <DeleteEntityDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        entityName={t('entities.trip')}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
});
