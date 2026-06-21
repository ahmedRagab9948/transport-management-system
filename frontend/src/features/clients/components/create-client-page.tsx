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
import { useCreateClient } from '../hooks/use-clients';
import type { CreateClientPayload } from '../types/client.types';
import { CreateClientForm } from '../forms/create-client-form';

export function CreateClientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const mutation = useCreateClient();
  const canCreate = hasPermission(PERMISSIONS.CREATE_CLIENT);

  function handleSubmit(payload: CreateClientPayload) {
    mutation.mutate(payload, {
      onSuccess: (client) => {
        toast({
          title: t('clients.client_created'),
          description: t('clients.client_created_desc', { name: client.companyName }),
          variant: 'success',
        });
        router.push(ROUTES.clients);
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
          title={t('clients.create_client')}
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
        title={t('clients.create_client')}
        description={t('clients.new_client')}
      />

      <FormCard>
        <CreateClientForm
          isSubmitting={mutation.isPending}
          errorMessage={
            mutation.error
              ? getApiErrorMessage(mutation.error, t('common.error_occurred'))
              : null
          }
          onSubmit={handleSubmit}
          onCancel={() => router.push(ROUTES.clients)}
        />
      </FormCard>
    </PageSection>
  );
}
