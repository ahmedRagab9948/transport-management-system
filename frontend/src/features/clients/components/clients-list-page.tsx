'use client';

import { Plus, Building2, CheckCircle2, XCircle } from 'lucide-react';
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
import { useClients } from '../hooks/use-clients';
import { clientsService } from '../services/clients.service';
import type { ClientStatus } from '../types/client.types';
import { useClientColumns } from './client-table-columns';

const DEFAULT_FILTERS = {
  search: undefined as string | undefined,
  status: undefined as ClientStatus | undefined,
  page: undefined as string | undefined,
  limit: undefined as string | undefined,
};

const FILTER_CHIPS = [
  { key: 'status', labelKey: 'common.status' },
  { key: 'search', labelKey: 'common.search' },
];

export function ClientsListPage() {
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const canCreateClient = hasPermission(PERMISSIONS.CREATE_CLIENT);
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
    namespace: 'clients',
  });

  const clientsQuery = useClients(queryParams);

  const summaryQuery = useQuery({
    queryKey: ['clients-summary'],
    queryFn: async () => {
      const res = await clientsService.getClients({ page: 1, limit: 99999 });
      return res.items;
    },
    staleTime: 5 * 60 * 1000,
  });
  const allClients = summaryQuery.data ?? [];
  const summaryCards = [
    { label: t('common.total'), value: clientsQuery.data?.meta?.total ?? 0, icon: <Building2 className="size-4" />, className: 'kpi-blue' },
    { label: t('common_statuses.active'), value: allClients.filter((c) => c.status === 'ACTIVE').length, icon: <CheckCircle2 className="size-4" />, className: 'kpi-emerald' },
    { label: t('common_statuses.inactive'), value: allClients.filter((c) => c.status === 'INACTIVE').length, icon: <XCircle className="size-4" />, className: 'kpi-rose' },
  ];

  const clientColumns = useClientColumns();

  async function exportToCsv() {
    const response = await clientsService.getClients({ page: 1, limit: 99999 });
    const allClients = response.items;
    const headers = ['companyName', 'contactPerson', 'email', 'phone', 'status'];
    const rows = allClients.map((c) => [
      c.companyName,
      c.contactPerson ?? '-',
      c.email ?? '-',
      c.phone ?? '-',
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
    a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('clients.title')}
        description={t('clients.page_description')}
        actions={
          <PageHeaderActions
            exportDisabled={(clientsQuery.data?.items?.length ?? 0) === 0}
            onExportCsv={exportToCsv}
            createHref={ROUTES.clientsNew}
            createLabel={t('clients.new_client')}
            canCreate={canCreateClient}
          />
        }
      />

      <SummaryCards
        cards={summaryCards}
        isLoading={clientsQuery.isLoading}
      />

      <AdvancedFilters
        variant="card"
        showSearchButton
        fields={[
          { type: 'search', key: 'search', label: t('filters.search'), placeholder: t('clients.search_placeholder') },
          { type: 'select', key: 'status', label: t('common.status'), options: [
            { value: 'ACTIVE', label: t('filters.active') },
            { value: 'INACTIVE', label: t('filters.inactive') },
          ], placeholder: t('filters.all_statuses') },
        ]}
        values={filters as Record<string, string | boolean | undefined>}
        onChange={(key, value) => setFilter(key as keyof typeof DEFAULT_FILTERS, value as any)}
        onReset={resetFilters}
      />

      <DataTableWrapper
        query={clientsQuery}
        columns={clientColumns}
        hideExport
        filterChips={filterChips}
        onFilterChipRemove={(key) => setFilter(key as keyof typeof DEFAULT_FILTERS, undefined)}
        onFilterChipsClear={resetFilters}
        emptyTitle={hasActiveFilters ? t('clients.no_clients_filtered') : t('clients.no_clients')}
        emptyDescription={
          hasActiveFilters
            ? t('clients.no_clients_filtered_desc')
            : t('clients.no_clients_desc')
        }
        emptyAction={!hasActiveFilters && canCreateClient ? (
          <Link href={ROUTES.clientsNew} className={buttonVariants({ variant: 'primary' })}>
            <Plus className="size-4" />
            {t('clients.new_client')}
          </Link>
        ) : undefined}
        errorTitle={t('clients.load_error')}
        onPageChange={(p) => setFilter('page', p)}
        onLimitChange={(l) => setFilter('limit', l)}
      />
    </PageSection>
  );
}
