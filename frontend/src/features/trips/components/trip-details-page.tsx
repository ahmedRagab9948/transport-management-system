'use client';

import { AlertCircle, Pencil, UserCheck, Play, CheckCircle2, XCircle } from 'lucide-react';
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
import { useTrip } from '../hooks/use-trips';
import { useUpdateTripStatus } from '../hooks/use-trips';
import type { TripStatus } from '../types/trip.types';
import { TripTimeline } from './trip-timeline';
import { AssignTripDialog } from './assign-trip-dialog';
import { StartTripDialog } from './start-trip-dialog';
import { CompleteTripDialog } from './complete-trip-dialog';
import { CancelTripDialog } from './cancel-trip-dialog';
import { ConflictWarningDialog } from './conflict-warning-dialog';

interface TripDetailsPageProps {
  tripId: string;
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

  const [dialogType, setDialogType] = useState<'assign' | 'start' | 'complete' | 'cancel' | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [conflictWarnings, setConflictWarnings] = useState<any[]>([]);

  async function handleStatusChange(data: { notes?: string; reasonCode?: string; actualEndDate?: string }) {
    if (!trip) return;
    const statusMap: Record<string, TripStatus> = { assign: 'ASSIGNED', start: 'DRIVER_CONFIRMED', complete: 'COMPLETED', cancel: 'CANCELLED' };
    const newStatus = statusMap[dialogType!];
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

  const canAssign = canEdit && ASSIGNABLE_STATUSES.includes(trip.status);
  const canConfirmDriver = hasPermission(PERMISSIONS.CONFIRM_DRIVER_ON_BEHALF);
  const canStart = canEdit && canConfirmDriver && trip.status === 'ASSIGNED';
  const canComplete = canEdit && COMPLETABLE_STATUSES.includes(trip.status);
  const canCancel = canEdit && CANCEL_STATUSES.includes(trip.status);

  const statusActionButtons = (
    <>
      {canAssign ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogType('assign')} aria-label={t('trips.assign')}>
                <UserCheck className="size-3.5" />
                {t('trips.assign')}
              </Button>
            }
          />
          <TooltipContent>{t('trips.assign_description')}</TooltipContent>
        </Tooltip>
      ) : null}
      {canStart ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogType('start')} aria-label={t('trips.start')}>
                <Play className="size-3.5" />
                {t('trips.start')}
              </Button>
            }
          />
          <TooltipContent>{t('trips.start_tooltip')}</TooltipContent>
        </Tooltip>
      ) : null}
      {canComplete ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogType('complete')} aria-label={t('trips.complete')}>
                <CheckCircle2 className="size-3.5" />
                {t('trips.complete')}
              </Button>
            }
          />
          <TooltipContent>{t('trips.complete_tooltip')}</TooltipContent>
        </Tooltip>
      ) : null}
      {canCancel ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button type="button" variant="danger" size="sm" onClick={() => setDialogType('cancel')} aria-label={t('trips.cancel_title')}>
                <XCircle className="size-3.5" />
                {t('common.cancel')}
              </Button>
            }
          />
          <TooltipContent>{t('trips.cancel_tooltip')}</TooltipContent>
        </Tooltip>
      ) : null}
      {canEdit ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (trip.status === 'ASSIGNED' || trip.status === 'DRIVER_CONFIRMED' || trip.status === 'LOADING' || trip.status === 'ON_ROUTE' || trip.status === 'WAITING' || trip.status === 'UNLOADING') {
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

      <AssignTripDialog
        open={dialogType === 'assign'}
        onOpenChange={(v) => { if (!v) setDialogType(null); }}
        onConfirm={(notes) => handleStatusChange({ notes })}
        isLoading={statusMutation.isPending}
      />
      <StartTripDialog
        open={dialogType === 'start'}
        onOpenChange={(v) => { if (!v) setDialogType(null); }}
        onConfirm={(notes) => handleStatusChange({ notes })}
        isLoading={statusMutation.isPending}
        vehicleCode={trip.vehicle?.vehicleCode}
        driverName={trip.driver?.fullName}
      />
      <CompleteTripDialog
        open={dialogType === 'complete'}
        onOpenChange={(v) => { if (!v) setDialogType(null); }}
        onConfirm={(data) => handleStatusChange(data)}
        isLoading={statusMutation.isPending}
      />
      <CancelTripDialog
        open={dialogType === 'cancel'}
        onOpenChange={(v) => { if (!v) setDialogType(null); }}
        onConfirm={(data) => handleStatusChange(data)}
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
