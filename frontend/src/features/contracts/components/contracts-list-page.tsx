'use client';

import { Plus, FileText, CheckCircle2, XCircle, ScrollText } from 'lucide-react';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { AdvancedFilters, DataTableWrapper, PageHeader, PageHeaderActions, PageSection, SummaryCards } from '@/components/shared';
import { buttonVariants } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useEntityFilters } from '@/components/shared/hooks/use-entity-filters';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useContracts } from '../hooks/use-contracts';
import { contractsService } from '../services/contracts.service';
import type { ContractStatus } from '../types/contract.types';
import { useContractColumns } from './contract-table-columns';

const DEFAULT_FILTERS = {
  search: undefined as string | undefined,
  status: undefined as ContractStatus | undefined,
  page: undefined as string | undefined,
  limit: undefined as string | undefined,
};

const FILTER_CHIPS = [
  { key: 'status', labelKey: 'common.status' },
  { key: 'search', labelKey: 'common.search' },
];

export function ContractsListPage() {
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const canCreateContract = hasPermission(PERMISSIONS.CREATE_CONTRACT);
  const {
    filters,
    setFilter,
    resetFilters,
    queryParams,
    filterChips,
    hasActiveFilters,
  } = useEntityFilters({
    defaults: DEFAULT_FILTERS,
    chips: FILTER_CHIPS as any,
    namespace: 'contracts',
  });

  const contractsQuery = useContracts(queryParams);

  const summaryQuery = useQuery({
    queryKey: ['contracts-summary'],
    queryFn: async () => {
      const res = await contractsService.getContracts({ page: 1, limit: 99999 });
      return res.items;
    },
    staleTime: 5 * 60 * 1000,
  });
  const allContracts = summaryQuery.data ?? [];
  const summaryCards = [
    { label: t('common.total'), value: contractsQuery.data?.meta?.total ?? 0, icon: <FileText className="size-4" />, className: 'kpi-blue' },
    { label: t('common_statuses.active'), value: allContracts.filter((c) => c.status === 'ACTIVE').length, icon: <ScrollText className="size-4" />, className: 'kpi-emerald' },
    { label: t('common_statuses.expired'), value: allContracts.filter((c) => c.status === 'EXPIRED').length, icon: <CheckCircle2 className="size-4" />, className: 'kpi-purple' },
    { label: t('common_statuses.terminated'), value: allContracts.filter((c) => c.status === 'TERMINATED').length, icon: <XCircle className="size-4" />, className: 'kpi-rose' },
  ];

  const contractColumns = useContractColumns();

  async function exportToCsv() {
    const response = await contractsService.getContracts({ page: 1, limit: 99999 });
    const allContracts = response.items;
    const headers = ['contractNumber', 'client', 'startDate', 'endDate', 'price', 'status'];
    const rows = allContracts.map((c) => [
      c.contractNumber,
      c.client?.companyName ?? '-',
      c.startDate ?? '-',
      c.endDate ?? '-',
      c.price ?? '-',
      c.status,
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contracts-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('contracts.title')}
        description={t('contracts.page_description')}
        actions={
          <PageHeaderActions
            exportDisabled={(contractsQuery.data?.items?.length ?? 0) === 0}
            onExportCsv={exportToCsv}
            createHref={ROUTES.contractsNew}
            createLabel={t('contracts.new_contract')}
            canCreate={canCreateContract}
          />
        }
      />

      <SummaryCards
        cards={summaryCards}
        isLoading={contractsQuery.isLoading}
      />

      <AdvancedFilters
        variant="card"
        showSearchButton
        fields={[
          { type: 'search', key: 'search', label: t('filters.search'), placeholder: t('contracts.search_placeholder') },
          { type: 'select', key: 'status', label: t('common.status'), options: [
            { value: 'DRAFT', label: t('filters.draft') },
            { value: 'ACTIVE', label: t('filters.active') },
            { value: 'COMPLETED', label: t('filters.completed') },
            { value: 'CANCELLED', label: t('filters.cancelled') },
          ], placeholder: t('filters.all_statuses') },
        ]}
        values={filters as Record<string, string | boolean | undefined>}
        onChange={(key, value) => setFilter(key as keyof typeof DEFAULT_FILTERS, value as any)}
        onReset={resetFilters}
      />

      <DataTableWrapper
        query={contractsQuery}
        columns={contractColumns}
        hideExport
        filterChips={filterChips}
        onFilterChipRemove={(key) => setFilter(key as keyof typeof DEFAULT_FILTERS, undefined)}
        onFilterChipsClear={resetFilters}
        emptyTitle={hasActiveFilters ? t('contracts.no_contracts_filtered') : t('contracts.no_contracts')}
        emptyDescription={
          hasActiveFilters
            ? t('contracts.no_contracts_filtered_desc')
            : t('contracts.no_contracts_desc')
        }
        emptyAction={!hasActiveFilters && canCreateContract ? (
          <Link href={ROUTES.contractsNew} className={buttonVariants({ variant: 'primary' })}>
            <Plus className="size-4" />
            {t('contracts.new_contract')}
          </Link>
        ) : undefined}
        errorTitle={t('contracts.load_error')}
        onPageChange={(p) => setFilter('page', p)}
        onLimitChange={(l) => setFilter('limit', l)}
      />
    </PageSection>
  );
}
