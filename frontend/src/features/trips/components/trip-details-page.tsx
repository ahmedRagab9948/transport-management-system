'use client';

import { AlertCircle, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmDialog, EmptyState, GlassCard, LoadingSkeleton, PageSection } from '@/components/shared';
import { DetailsLayout, DetailField, DetailSection } from '@/components/shared';
import { StatusBadge } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { getAvailableActions, LIFECYCLE_ACTIONS } from '../constants/trip-lifecycle';
import type { TripActionType } from '../constants/trip-lifecycle';
import { useTrip } from '../hooks/use-trips';
import { useUpdateTripStatus } from '../hooks/use-trips';
import type { TripStatus } from '../types/trip.types';
import { TripTimeline } from './trip-timeline';
import { AssignTripDialog } from './assign-trip-dialog';
import { StartTripDialog } from './start-trip-dialog';
import { CompleteTripDialog } from './complete-trip-dialog';
import { CancelTripDialog } from './cancel-trip-dialog';
import { ConflictWarningDialog } from './conflict-warning-dialog';
import * as Icons from 'lucide-react';

interface TripDetailsPageProps {
  tripId: string;
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

export function TripDetailsPage({ tripId }: TripDetailsPageProps) {
  const router = useRouter();
  const { t, locale } = useT();
  const formatDate = (value: string | null) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  };
  const { hasPermission } = usePermissions();
  const { data: trip, isLoading, error } = useTrip(tripId);
  const statusMutation = useUpdateTripStatus();
  const canEdit = hasPermission(PERMISSIONS.UPDATE_TRIP);
  const canDelete = hasPermission(PERMISSIONS.DELETE_TRIP);

  const [dialogType, setDialogType] = useState<TripActionType | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [conflictWarnings, setConflictWarnings] = useState<any[]>([]);

  const availableActions = trip ? getAvailableActions(trip.status, canEdit, hasPermission) : [];

  async function handleStatusChange(data: { notes?: string; reasonCode?: string; actualEndDate?: string }) {
    if (!trip) return;
    const def = dialogType ? LIFECYCLE_ACTIONS.find((a) => a.type === dialogType) : undefined;
    const newStatus = def ? def.resolveTarget(trip.status) : 'ASSIGNED';
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
      if ((result as any)?.warnings?.length > 0) {
        setConflictWarnings((result as any).warnings);
        return;
      }
      setDialogType(null);
    } catch (err: any) {
      const warnings = err?.warnings;
      if (warnings?.length > 0) {
        setConflictWarnings(warnings);
      }
    }
  }

  if (isLoading) {
    return (
      <PageSection variant="wrapper">
        <LoadingSkeleton variant="form" />
    </PageSection>
  );
  }

  if (error || !trip) {
    return (
      <PageSection variant="wrapper">
        <GlassCard variant="surface" className="p-6">
            <EmptyState
              icon={AlertCircle}
              title={`${t('entities.trip')} ${t('errors.not_found')}`}
              description={t('errors.load_failed')}
              actionLabel={t('common.back')}
              onAction={() => window.history.back()}
              className="border-0 bg-transparent"
            />
        </GlassCard>
    </PageSection>
  );
  }

  const statusActionButtons = (
    <>
      {availableActions.map((action) => {
        const IconComp = (Icons as any)[action.icon];
        const isCancel = action.type === 'cancel';
        return (
          <Tooltip key={action.type}>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant={isCancel ? 'danger' : 'outline'}
                  size="sm"
                  onClick={() => setDialogType(action.type)}
                  aria-label={t(`${action.i18nKey}`)}
                >
                  {IconComp ? <IconComp className="size-3.5" /> : null}
                  {t(`${action.i18nKey}`)}
                </Button>
              }
            />
            <TooltipContent>
              {(() => {
                const tooltipKey = `${action.i18nKey}_tooltip`;
                const tt = t(tooltipKey);
                return tt !== tooltipKey ? tt : t(`${action.i18nKey}_description`);
              })()}
            </TooltipContent>
          </Tooltip>
        );
      })}
      {canEdit ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const activeStatuses: TripStatus[] = ['ASSIGNED', 'DRIVER_CONFIRMED', 'LOADING', 'ON_ROUTE', 'WAITING', 'UNLOADING'];
                  if (activeStatuses.includes(trip.status)) {
                    setShowEditConfirm(true);
                  } else {
                    router.push(ROUTES.tripsEdit(tripId));
                  }
                }}
                aria-label={t('common.edit')}
              >
                <Pencil className="size-3.5" />
                {t('common.edit')}
              </Button>
            }
          />
          <TooltipContent>{t('common.edit')}</TooltipContent>
        </Tooltip>
      ) : null}
    </>
  );

  return (
    <DetailsLayout
      title={`${t('entities.trip')} ${trip.tripNumber}`}
      subtitle={trip.createdBy
        ? `${t('common.created_at')} ${formatDate(trip.createdAt)} · ${t('entities.user')}: ${trip.createdBy.fullName}`
        : `${t('common.created_at')} ${formatDate(trip.createdAt)}`
      }
      statusBadge={<StatusBadge status={trip.status} domain="trip" />}
      actions={statusActionButtons}
      backHref={ROUTES.trips}
    >
      <DetailSection title={t('details.route_information')}>
        <DetailField label={t('trips.from_location')} value={trip.fromLocation} />
        <DetailField label={t('trips.to_location')} value={trip.toLocation} />
        <DetailField label={t('trips.vehicle')} value={trip.vehicle?.vehicleCode ?? '-'} />
        <DetailField label={t('trips.driver')} value={trip.driver?.fullName ?? '-'} />
      </DetailSection>

      <DetailSection title={t('details.schedule')}>
        <DetailField label={t('trips.start_date')} value={formatDate(trip.startDate)} />
        <DetailField label={t('trips.end_date')} value={formatDate(trip.endDate)} />
        <DetailField label={t('trips.actual_end_date')} value={formatDate(trip.actualEndDate)} />
      </DetailSection>

      {trip.cargoDescription || trip.notes ? (
        <DetailSection title={t('details.additional_notes')}>
          {trip.cargoDescription ? (
            <DetailField label={t('trips.cargo_description')} value={trip.cargoDescription} className="sm:col-span-2" />
          ) : null}
          {trip.notes ? (
            <DetailField label={t('common.notes')} value={trip.notes} className="sm:col-span-2" />
          ) : null}
        </DetailSection>
      ) : null}

      <DetailSection title={t('trips.timeline')}>
        <div className="sm:col-span-3">
          <TripTimeline history={trip.statusHistories} />
        </div>
      </DetailSection>

      {dialogType === 'assign' ? (
        <AssignTripDialog
          open
          onOpenChange={(v) => { if (!v) setDialogType(null); }}
          onConfirm={(notes) => handleStatusChange({ notes })}
          isLoading={statusMutation.isPending}
        />
      ) : null}
      {dialogType === 'complete' ? (
        <CompleteTripDialog
          open
          onOpenChange={(v) => { if (!v) setDialogType(null); }}
          onConfirm={(data) => handleStatusChange(data)}
          isLoading={statusMutation.isPending}
        />
      ) : null}
      {dialogType === 'cancel' ? (
        <CancelTripDialog
          open
          onOpenChange={(v) => { if (!v) setDialogType(null); }}
          onConfirm={(data) => handleStatusChange(data)}
          isLoading={statusMutation.isPending}
        />
      ) : null}
      {dialogType && dialogType !== 'assign' && dialogType !== 'complete' && dialogType !== 'cancel' ? (
        (() => {
          const def = LIFECYCLE_ACTIONS.find((a) => a.type === dialogType);
          if (!def) return null;
          return (
            <StartTripDialog
              open
              onOpenChange={(v) => { if (!v) setDialogType(null); }}
              onConfirm={(notes) => handleStatusChange({ notes })}
              isLoading={statusMutation.isPending}
              vehicleCode={trip.vehicle?.vehicleCode}
              driverName={trip.driver?.fullName}
              i18nPrefix={def.i18nKey}
              confirmLabel={t('common.confirm')}
            />
          );
        })()
      ) : null}
      <ConfirmDialog
        open={showEditConfirm}
        onOpenChange={setShowEditConfirm}
        title={t('trips.edit_active_trip_title')}
        description={t('trips.edit_active_trip_description')}
        confirmLabel={t('common.edit')}
        onConfirm={() => {
          setShowEditConfirm(false);
          router.push(ROUTES.tripsEdit(tripId));
        }}
      />

      <ConflictWarningDialog
        open={conflictWarnings.length > 0}
        onOpenChange={(v) => { if (!v) setConflictWarnings([]); }}
        warnings={conflictWarnings}
        onContinue={() => { setDialogType(null); setConflictWarnings([]); }}
        onEditDates={() => { setDialogType(null); setConflictWarnings([]); }}
        isLoading={statusMutation.isPending}
      />
    </DetailsLayout>
  );
}
