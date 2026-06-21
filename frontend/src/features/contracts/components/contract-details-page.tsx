'use client';

import { AlertCircle, FileText, Building2, MapPin, DollarSign } from 'lucide-react';

import { EmptyState, GlassCard, LoadingSkeleton, PageSection } from '@/components/shared';
import { DetailsLayout, DetailField, DetailSection } from '@/components/shared';
import { StatusBadge } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useContract } from '../hooks/use-contracts';

interface ContractDetailsPageProps {
  contractId: string;
}

export function ContractDetailsPage({ contractId }: ContractDetailsPageProps) {
  const { t, locale } = useT();
  const formatDate = (value: string | null) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(value));
  };
  const { hasPermission } = usePermissions();
  const { data: contract, isLoading, error } = useContract(contractId);
  const canEdit = hasPermission(PERMISSIONS.UPDATE_CONTRACT);

  if (isLoading) {
    return (
      <PageSection variant="wrapper">
        <LoadingSkeleton variant="form" />
    </PageSection>
  );
  }

  if (error || !contract) {
    return (
      <PageSection variant="wrapper">
        <GlassCard variant="surface" className="p-6">
            <EmptyState
              icon={AlertCircle}
              title={`${t('entities.contract')} ${t('errors.not_found')}`}
              description={t('errors.load_failed')}
              actionLabel={t('common.back')}
              onAction={() => window.history.back()}
              className="border-0 bg-transparent"
            />
        </GlassCard>
    </PageSection>
  );
  }

  return (
    <DetailsLayout
      title={`${t('entities.contract')} ${contract.contractNumber}`}
      subtitle={`${contract.title} · ${t('common.created_at')} ${formatDate(contract.createdAt)}`}
      statusBadge={<StatusBadge status={contract.status} domain="contract" />}
      editHref={canEdit ? ROUTES.contractsEdit(contractId) : undefined}
      backHref={ROUTES.contracts}
    >
      <DetailSection title={t('details.general_information')}>
        <DetailField
          label={t('contracts.contract_number')}
          value={(
            <span className="flex items-center gap-2">
              <FileText className="size-3.5 text-muted-foreground" />
              {contract.contractNumber}
            </span>
          )}
        />
        <DetailField
          label={t('contracts.title_field')}
          value={contract.title}
        />
        <DetailField
          label={t('clients.title')}
          value={(
            <span className="flex items-center gap-2">
              <Building2 className="size-3.5 text-muted-foreground" />
              {contract.client.companyName}
            </span>
          )}
        />
      </DetailSection>

      <DetailSection title={t('details.route_information')}>
        <DetailField
          label={t('contracts.from_location')}
          value={(
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5 text-muted-foreground" />
              {contract.fromLocation ?? '-'}
            </span>
          )}
        />
        <DetailField
          label={t('contracts.to_location')}
          value={(
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5 text-muted-foreground" />
              {contract.toLocation ?? '-'}
            </span>
          )}
        />
      </DetailSection>

      <DetailSection title={t('details.financial_information')}>
        <DetailField
          label={t('contracts.price')}
          value={(
            <span className="flex items-center gap-2">
              <DollarSign className="size-3.5 text-muted-foreground" />
              {contract.price ? `${Number(contract.price).toLocaleString()} ${contract.currency}` : '-'}
            </span>
          )}
        />
        <DetailField
          label={t('contracts.start_date')}
          value={formatDate(contract.startDate)}
        />
        <DetailField
          label={t('contracts.end_date')}
          value={formatDate(contract.endDate)}
        />
      </DetailSection>

      {contract.description ? (
        <DetailSection title={t('contracts.description')}>
          <DetailField label={t('contracts.description')} value={contract.description} className="sm:col-span-2" />
        </DetailSection>
      ) : null}

      {contract.notes ? (
        <DetailSection title={t('common.notes')}>
          <DetailField label={t('common.notes')} value={contract.notes} className="sm:col-span-2" />
        </DetailSection>
      ) : null}
    </DetailsLayout>
  );
}
