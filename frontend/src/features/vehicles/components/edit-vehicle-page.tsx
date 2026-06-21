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
import { useVehicle, useUpdateVehicle } from '../hooks/use-vehicles';
import type { UpdateVehiclePayload } from '../types/vehicle.types';
import { UpdateVehicleForm } from '../forms/update-vehicle-form';

interface EditVehiclePageProps {
  vehicleId: string;
}

export function EditVehiclePage({ vehicleId }: EditVehiclePageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);
  const mutation = useUpdateVehicle(vehicleId);
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_VEHICLE);

  function handleSubmit(payload: UpdateVehiclePayload) {
    mutation.mutate(payload, {
      onSuccess: (updated) => {
        toast({
          title: t('vehicles.vehicle_updated'),
          description: t('vehicles.vehicle_updated_desc', { code: updated.vehicleCode }),
          variant: 'success',
        });
        router.push(ROUTES.vehicles);
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
        <PageHeader title={t('vehicles.edit_vehicle')} description={t('vehicles.vehicle_details')} />
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
        <PageHeader title={t('vehicles.edit_vehicle')} description={t('common.loading')} />
        <LoadingSkeleton variant="form" />
      </PageSection>
    );
  }

  if (error || !vehicle) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('vehicles.edit_vehicle')} description={t('common.error_occurred')} />
        <EmptyState
          icon={AlertCircle}
          title={t('common.no_results')}
          description={getApiErrorMessage(error, 'Vehicle not found.')}
          actionLabel={t('common.back')}
          onAction={() => router.push(ROUTES.vehicles)}
        />
      </PageSection>
    );
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={`Edit ${vehicle.vehicleCode}`}
        description={t('vehicles.edit_vehicle')}
      />

      <FormCard>
        <UpdateVehicleForm
          vehicle={vehicle}
          isSubmitting={mutation.isPending}
          errorMessage={
            mutation.error
              ? getApiErrorMessage(mutation.error, t('common.error_occurred'))
              : null
          }
          onSubmit={handleSubmit}
          onCancel={() => router.push(ROUTES.vehicles)}
        />
      </FormCard>
    </PageSection>
  );
}
