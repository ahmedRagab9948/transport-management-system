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
import { useDriver, useUpdateDriver } from '../hooks/use-drivers';
import type { UpdateDriverPayload } from '../types/driver.types';
import { UpdateDriverForm } from '../forms/update-driver-form';

interface EditDriverPageProps {
  driverId: string;
}

export function EditDriverPage({ driverId }: EditDriverPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const { data: driver, isLoading, error } = useDriver(driverId);
  const mutation = useUpdateDriver(driverId);
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_DRIVER);

  function handleSubmit(payload: UpdateDriverPayload) {
    mutation.mutate(payload, {
      onSuccess: (updated) => {
        toast({
          title: t('drivers.driver_updated'),
          description: t('drivers.driver_updated_desc', { name: updated.fullName }),
          variant: 'success',
        });
        router.push(ROUTES.drivers);
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
        <PageHeader title={t('drivers.edit_driver')} description={t('drivers.update_driver')} />
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
        <PageHeader title={t('drivers.edit_driver')} description={t('common.loading')} />
        <LoadingSkeleton variant="form" />
      </PageSection>
    );
  }

  if (error || !driver) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('drivers.edit_driver')} description={t('common.error_occurred')} />
        <EmptyState
          icon={AlertCircle}
          title={t('common.no_results')}
          description={getApiErrorMessage(error, 'Driver not found.')}
          actionLabel={t('common.back')}
          onAction={() => router.push(ROUTES.drivers)}
        />
      </PageSection>
    );
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={`Edit ${driver.fullName}`}
        description={t('drivers.update_driver')}
      />

      <FormCard>
        <UpdateDriverForm
          driver={driver}
          isSubmitting={mutation.isPending}
          errorMessage={
            mutation.error
              ? getApiErrorMessage(mutation.error, t('common.error_occurred'))
              : null
          }
          onSubmit={handleSubmit}
          onCancel={() => router.push(ROUTES.drivers)}
        />
      </FormCard>
    </PageSection>
  );
}
