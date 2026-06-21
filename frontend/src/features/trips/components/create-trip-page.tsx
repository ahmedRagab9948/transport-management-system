'use client';

import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { EmptyState, FormCard, PageHeader, PageSection } from '@/components/shared';
import { useToast } from '@/components/ui/toast';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useT } from '@/lib/i18n';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { useCreateTrip } from '../hooks/use-trips';
import type { CreateTripPayload } from '../types/trip.types';
import { CreateTripForm } from '../forms/create-trip-form';

export function CreateTripPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const mutation = useCreateTrip();
  const canCreate = hasPermission(PERMISSIONS.CREATE_TRIP);

  function handleSubmit(payload: CreateTripPayload) {
    mutation.mutate(payload, {
      onSuccess: (trip) => {
        toast({
          title: t('trips.trip_created'),
          description: t('trips.trip_created_desc', { number: trip.tripNumber, origin: trip.fromLocation, destination: trip.toLocation }),
          variant: 'success',
        });
        router.push(ROUTES.trips);
        router.refresh();
      },
      onError: (error) => {
        toast({
          title: t('common.operation_failed'),
          description: getApiErrorMessage(error, t('common.retry')),
          variant: 'error',
        });
      },
    });
  }

  if (!canCreate) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader
          title={t('trips.create_trip')}
          description={t('nav.dashboard_description')}
        />
        <EmptyState
          icon={ShieldAlert}
          title={t('common.no_data')}
          description={t('common.no_permission')}
        />
      </PageSection>
    );
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('trips.create_trip')}
        description={t('trips.new_trip')}
      />

      <FormCard>
        <CreateTripForm
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
