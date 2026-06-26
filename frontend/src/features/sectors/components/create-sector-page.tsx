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
import { useCreateSector } from '../hooks/use-sectors';
import type { CreateSectorPayload } from '../types/sector.types';
import { SectorForm } from './sector-form';

export function CreateSectorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const mutation = useCreateSector();
  const canCreate = hasPermission(PERMISSIONS.CREATE_SECTOR);

  function handleSubmit(payload: CreateSectorPayload) {
    mutation.mutate(payload, {
      onSuccess: (sector) => {
        toast({
          title: t('sectors.sector_created'),
          description: t('sectors.sector_created_desc', { name: sector.name }),
          variant: 'success',
        });
        router.push(ROUTES.sectorsDetail(sector.id));
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
        <PageHeader title={t('sectors.create_sector')} description={t('common.no_permission')} />
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
        title={t('sectors.create_sector')}
        description={t('sectors.new_sector')}
      />

      <FormCard>
        <SectorForm
          isSubmitting={mutation.isPending}
          errorMessage={
            mutation.error
              ? getApiErrorMessage(mutation.error, t('common.error_occurred'))
              : null
          }
          onSubmit={handleSubmit as any}
          onCancel={() => router.push(ROUTES.sectors)}
        />
      </FormCard>
    </PageSection>
  );
}
