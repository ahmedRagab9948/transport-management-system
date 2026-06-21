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
import { useContract, useUpdateContract } from '../hooks/use-contracts';
import type { UpdateContractPayload } from '../types/contract.types';
import { UpdateContractForm } from '../forms/update-contract-form';

interface EditContractPageProps {
  contractId: string;
}

export function EditContractPage({ contractId }: EditContractPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const { data: contract, isLoading, error } = useContract(contractId);
  const mutation = useUpdateContract(contractId);
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_CONTRACT);

  function handleSubmit(payload: UpdateContractPayload) {
    mutation.mutate(payload, {
      onSuccess: (updated) => {
        toast({
          title: t('contracts.contract_updated'),
          description: t('contracts.contract_updated_desc', { number: updated.contractNumber }),
          variant: 'success',
        });
        router.push(ROUTES.contracts);
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
        <PageHeader title={t('contracts.edit_contract')} description={t('contracts.update_contract')} />
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
        <PageHeader title={t('contracts.edit_contract')} description={t('common.loading')} />
        <LoadingSkeleton variant="form" />
      </PageSection>
    );
  }

  if (error || !contract) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('contracts.edit_contract')} description={t('common.error_occurred')} />
        <EmptyState
          icon={AlertCircle}
          title={t('common.no_results')}
          description={getApiErrorMessage(error, 'Contract not found.')}
          actionLabel={t('common.back')}
          onAction={() => router.push(ROUTES.contracts)}
        />
      </PageSection>
    );
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={`Edit ${contract.contractNumber}`}
        description={t('contracts.update_contract')}
      />

      <FormCard>
        <UpdateContractForm
          contract={contract}
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
