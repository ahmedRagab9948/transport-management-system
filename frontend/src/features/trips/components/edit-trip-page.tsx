'use client';

import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { EmptyState, FormCard, LoadingSkeleton, PageHeader, PageSection } from '@/components/shared';
import { useToast } from '@/components/ui/toast';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useT } from '@/lib/i18n';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { useTrip, useUpdateTrip } from '../hooks/use-trips';
import type { UpdateTripPayload } from '../types/trip.types';
import { UpdateTripForm } from '../forms/update-trip-form';

interface EditTripPageProps {
  tripId: string;
}

export function EditTripPage({ tripId }: EditTripPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const { data: trip, isLoading, error } = useTrip(tripId);
  const mutation = useUpdateTrip(tripId);
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_TRIP);

  function handleSubmit(payload: UpdateTripPayload) {
    mutation.mutate(payload, {
      onSuccess: (updated) => {
        toast({
          title: t('trips.trip_updated'),
          description: t('trips.trip_updated_desc', { number: updated.tripNumber }),
          variant: 'success',
        });
        router.push(ROUTES.trips);
        router.refresh();
      },
      onError: (err) => {
        toast({
          title: t('common.operation_failed'),
          description: getApiErrorMessage(err, t('common.retry')),
          variant: 'error',
        });
      },
    });
  }

  if (!canUpdate) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('trips.edit_trip')} description={t('trips.trip_details')} />
        <EmptyState
          icon={ShieldAlert}
          title={t('common.no_data')}
          description={t('common.no_permission')}
        />
      </PageSection>
    );
  }

  if (isLoading) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('trips.edit_trip')} description={t('common.loading')} />
        <LoadingSkeleton variant="form" />
      </PageSection>
    );
  }

  if (error || !trip) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('trips.edit_trip')} description={t('common.error_occurred')} />
        <EmptyState
          icon={AlertCircle}
          title={t('common.no_results')}
          description={getApiErrorMessage(error, 'Trip not found.')}
          actionLabel={t('common.back')}
          onAction={() => router.push(ROUTES.trips)}
        />
      </PageSection>
    );
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={`Edit ${trip.tripNumber}`}
        description={t('trips.edit_trip')}
      />

      <FormCard>
        <UpdateTripForm
          trip={trip}
          isSubmitting={mutation.isPending}
          errorMessage={
            mutation.error
              ? getApiErrorMessage(mutation.error, t('common.error_occurred'))
              : null
          }
          onSubmit={handleSubmit}
          onCancel={() => router.push(ROUTES.trips)}
        />
      </FormCard>
    </PageSection>
  );
}
