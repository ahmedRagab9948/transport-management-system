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
import { useCreateContract } from '../hooks/use-contracts';
import type { CreateContractPayload } from '../types/contract.types';
import { CreateContractForm } from '../forms/create-contract-form';

export function CreateContractPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const mutation = useCreateContract();
  const canCreate = hasPermission(PERMISSIONS.CREATE_CONTRACT);

  function handleSubmit(payload: CreateContractPayload) {
    mutation.mutate(payload, {
      onSuccess: (contract) => {
        toast({
          title: t('contracts.contract_created'),
          description: t('contracts.contract_created_desc', { number: contract.contractNumber }),
          variant: 'success',
        });
        router.push(ROUTES.contracts);
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
          title={t('contracts.create_contract')}
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
        title={t('contracts.create_contract')}
        description={t('contracts.new_contract')}
      />

      <FormCard>
        <CreateContractForm
          isSubmitting={mutation.isPending}
          errorMessage={
            mutation.error
              ? getApiErrorMessage(mutation.error, t('common.error_occurred'))
              : null
          }
          onSubmit={handleSubmit}
          onCancel={() => router.push(ROUTES.contracts)}
        />
      </FormCard>
    </PageSection>
  );
}
