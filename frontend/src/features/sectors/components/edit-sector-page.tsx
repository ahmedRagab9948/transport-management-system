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
import { useSector, useUpdateSector } from '../hooks/use-sectors';
import type { UpdateSectorPayload } from '../types/sector.types';
import { SectorForm } from './sector-form';

interface EditSectorPageProps {
  sectorId: string;
}

export function EditSectorPage({ sectorId }: EditSectorPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const { data: sector, isLoading, error } = useSector(sectorId);
  const mutation = useUpdateSector(sectorId);
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_SECTOR);

  function handleSubmit(payload: UpdateSectorPayload) {
    mutation.mutate(payload, {
      onSuccess: (updated) => {
        toast({
          title: t('sectors.sector_updated'),
          description: t('sectors.sector_updated_desc', { name: updated.name }),
          variant: 'success',
        });
        router.push(ROUTES.sectorsDetail(sectorId));
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
        <PageHeader title={t('sectors.edit_sector')} description={t('common.no_permission')} />
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
        <PageHeader title={t('sectors.edit_sector')} description={t('common.loading')} />
        <LoadingSkeleton variant="form" />
      </PageSection>
    );
  }

  if (error || !sector) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('sectors.edit_sector')} description={t('common.error_occurred')} />
        <EmptyState
          icon={AlertCircle}
          title={t('common.no_results')}
          description={getApiErrorMessage(error, t('common.retry'))}
          actionLabel={t('common.back')}
          onAction={() => router.push(ROUTES.sectors)}
        />
      </PageSection>
    );
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('sectors.edit_sector')}
        description={`${sector.name} (${sector.code})`}
      />

      <FormCard>
        <SectorForm
          sector={sector}
          isSubmitting={mutation.isPending}
          errorMessage={
            mutation.error
              ? getApiErrorMessage(mutation.error, t('common.error_occurred'))
              : null
          }
          onSubmit={handleSubmit as any}
          onCancel={() => router.push(ROUTES.sectorsDetail(sectorId))}
        />
      </FormCard>
    </PageSection>
  );
}
