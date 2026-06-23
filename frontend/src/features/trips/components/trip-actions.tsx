'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Play,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmDialog, DeleteEntityDialog } from '@/components/shared';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { useDeleteTrip, useUpdateTripStatus } from '../hooks/use-trips';
import type { TripStatus } from '../types/trip.types';
import { AssignTripDialog } from './assign-trip-dialog';
import { StartTripDialog } from './start-trip-dialog';
import { CompleteTripDialog } from './complete-trip-dialog';
import { CancelTripDialog } from './cancel-trip-dialog';
import { ConflictWarningDialog } from './conflict-warning-dialog';

interface TripActionsProps {
  trip: {
    id: string;
    status: TripStatus;
    tripNumber: string;
    vehicle?: { vehicleCode: string } | null;
    driver?: { fullName: string } | null;
  };
}

const VALID_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  DRAFT: ['PENDING', 'CANCELLED'],
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['DRIVER_CONFIRMED', 'CANCELLED'],
  DRIVER_CONFIRMED: ['LOADING', 'CANCELLED'],
  LOADING: ['ON_ROUTE', 'CANCELLED'],
  ON_ROUTE: ['WAITING', 'UNLOADING', 'CANCELLED'],
  WAITING: ['ON_ROUTE', 'UNLOADING', 'CANCELLED'],
  UNLOADING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const CANCEL_STATUSES: TripStatus[] = ['DRAFT', 'PENDING', 'ASSIGNED', 'DRIVER_CONFIRMED', 'LOADING', 'ON_ROUTE', 'WAITING', 'UNLOADING'];
const ASSIGNABLE_STATUSES: TripStatus[] = ['PENDING'];
const STARTABLE_STATUSES: TripStatus[] = ['ASSIGNED', 'DRIVER_CONFIRMED'];
const COMPLETABLE_STATUSES: TripStatus[] = ['UNLOADING'];

export function TripActions({ trip }: TripActionsProps) {
  const router = useRouter();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const deleteMutation = useDeleteTrip();
  const statusMutation = useUpdateTripStatus();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'assign' | 'start' | 'complete' | 'cancel' | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [conflictWarnings, setConflictWarnings] = useState<any[]>([]);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const canView = hasPermission(PERMISSIONS.VIEW_TRIPS);
  const canEdit = hasPermission(PERMISSIONS.UPDATE_TRIP);
  const canDelete = hasPermission(PERMISSIONS.DELETE_TRIP) && trip.status === 'PENDING';

  const canAssign = canEdit && ASSIGNABLE_STATUSES.includes(trip.status);
  const canConfirmDriver = hasPermission(PERMISSIONS.CONFIRM_DRIVER_ON_BEHALF);
  const canStart = canEdit && canConfirmDriver && trip.status === 'ASSIGNED';
  const canComplete = canEdit && COMPLETABLE_STATUSES.includes(trip.status);
  const canCancel = canEdit && CANCEL_STATUSES.includes(trip.status);

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
    switch (dialogType) {
      case 'assign': return 'ASSIGNED';
      case 'start': return 'DRIVER_CONFIRMED';
      case 'complete': return 'COMPLETED';
      case 'cancel': return 'CANCELLED';
      default: return 'PENDING';
    }
  }

  function handleDelete() {
    return deleteMutation.mutateAsync(trip.id);
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
                    if (trip.status === 'ASSIGNED' || trip.status === 'DRIVER_CONFIRMED' || trip.status === 'LOADING' || trip.status === 'ON_ROUTE' || trip.status === 'WAITING' || trip.status === 'UNLOADING') {
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

        {canAssign ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDialogType('assign')}
                  aria-label={t('trips.assign')}
                >
                  <UserCheck className="size-4" />
                </Button>
              }
            />
            <TooltipContent>{t('trips.assign')}</TooltipContent>
          </Tooltip>
        ) : null}

        {canStart ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDialogType('start')}
                  aria-label={t('trips.start')}
                >
                  <Play className="size-4" />
                </Button>
              }
            />
            <TooltipContent>{t('trips.start')}</TooltipContent>
          </Tooltip>
        ) : null}

        {canComplete ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDialogType('complete')}
                  aria-label={t('trips.complete')}
                >
                  <CheckCircle2 className="size-4" />
                </Button>
              }
            />
            <TooltipContent>{t('trips.complete')}</TooltipContent>
          </Tooltip>
        ) : null}

        {canCancel ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDialogType('cancel')}
                  aria-label={t('common.cancel')}
                >
                  <XCircle className="size-4 text-destructive/70" />
                </Button>
              }
            />
            <TooltipContent>{t('common.cancel')}</TooltipContent>
          </Tooltip>
        ) : null}

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

      <AssignTripDialog
        open={dialogType === 'assign'}
        onOpenChange={(v) => { if (!v) closeDialog(); }}
        onConfirm={(notes) => handleStatusChange({ notes })}
        isLoading={statusMutation.isPending}
      />

      <StartTripDialog
        open={dialogType === 'start'}
        onOpenChange={(v) => { if (!v) closeDialog(); }}
        onConfirm={(notes) => handleStatusChange({ notes })}
        isLoading={statusMutation.isPending}
        vehicleCode={trip.vehicle?.vehicleCode}
        driverName={trip.driver?.fullName}
      />

      <CompleteTripDialog
        open={dialogType === 'complete'}
        onOpenChange={(v) => { if (!v) closeDialog(); }}
        onConfirm={(data) => handleStatusChange(data)}
        isLoading={statusMutation.isPending}
      />

      <CancelTripDialog
        open={dialogType === 'cancel'}
        onOpenChange={(v) => { if (!v) closeDialog(); }}
        onConfirm={(data) => handleStatusChange(data)}
        isLoading={statusMutation.isPending}
      />

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
}
