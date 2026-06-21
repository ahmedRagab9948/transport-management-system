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
import { useClient, useUpdateClient } from '../hooks/use-clients';
import type { UpdateClientPayload } from '../types/client.types';
import { UpdateClientForm } from '../forms/update-client-form';

interface EditClientPageProps {
  clientId: string;
}

export function EditClientPage({ clientId }: EditClientPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const { data: client, isLoading, error } = useClient(clientId);
  const mutation = useUpdateClient(clientId);
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_CLIENT);

  function handleSubmit(payload: UpdateClientPayload) {
    mutation.mutate(payload, {
      onSuccess: (updated) => {
        toast({
          title: t('clients.client_updated'),
          description: t('clients.client_updated_desc', { name: updated.companyName }),
          variant: 'success',
        });
        router.push(ROUTES.clients);
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
        <PageHeader title={t('clients.edit_client')} description={t('clients.update_client')} />
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
        <PageHeader title={t('clients.edit_client')} description={t('common.loading')} />
        <LoadingSkeleton variant="form" />
      </PageSection>
    );
  }

  if (error || !client) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('clients.edit_client')} description={t('common.error_occurred')} />
        <EmptyState
          icon={AlertCircle}
          title={t('common.no_results')}
          description={getApiErrorMessage(error, 'Client not found.')}
          actionLabel={t('common.back')}
          onAction={() => router.push(ROUTES.clients)}
        />
      </PageSection>
    );
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={`Edit ${client.companyName}`}
        description={t('clients.update_client')}
      />

      <FormCard>
        <UpdateClientForm
          client={client}
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
