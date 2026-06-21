'use client';

import { Plus, Users, CheckCircle2, UserCheck, UserX } from 'lucide-react';
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
import { useDrivers } from '../hooks/use-drivers';
import { driversService } from '../services/drivers.service';
import type { DriverStatus } from '../types/driver.types';
import { useDriverColumns } from './driver-table-columns';

const DEFAULT_FILTERS = {
  search: undefined as string | undefined,
  status: undefined as DriverStatus | undefined,
  availableOnly: undefined as boolean | undefined,
  page: undefined as string | undefined,
  limit: undefined as string | undefined,
};

const FILTER_CHIPS = [
  { key: 'status', labelKey: 'common.status' },
  { key: 'availableOnly', labelKey: 'filters.available', hideValue: true },
  { key: 'search', labelKey: 'common.search' },
];

export function DriversListPage() {
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const canCreateDriver = hasPermission(PERMISSIONS.CREATE_DRIVER);
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
    namespace: 'drivers',
  });

  const driversQuery = useDrivers(queryParams);

  const summaryQuery = useQuery({
    queryKey: ['drivers-summary'],
    queryFn: async () => {
      const res = await driversService.getDrivers({ page: 1, limit: 99999 });
      return res.items;
    },
    staleTime: 5 * 60 * 1000,
  });
  const allDrivers = summaryQuery.data ?? [];
  const summaryCards = [
    { label: t('common.total'), value: driversQuery.data?.meta?.total ?? 0, icon: <Users className="size-4" />, className: 'kpi-blue' },
    { label: t('common_statuses.active'), value: allDrivers.filter((d) => d.status === 'ACTIVE').length, icon: <CheckCircle2 className="size-4" />, className: 'kpi-emerald' },
    { label: t('common_statuses.assigned'), value: allDrivers.filter((d) => d.status === 'IN_TRIP').length, icon: <UserCheck className="size-4" />, className: 'kpi-cyan' },
    { label: t('common_statuses.inactive'), value: allDrivers.filter((d) => d.status === 'INACTIVE' || d.status === 'SUSPENDED').length, icon: <UserX className="size-4" />, className: 'kpi-rose' },
  ];

  const driverColumns = useDriverColumns();

  async function exportToCsv() {
    const response = await driversService.getDrivers({ page: 1, limit: 99999 });
    const allDrivers = response.items;
    const headers = ['driverCode', 'fullName', 'phone', 'nationalId', 'licenseNumber', 'status'];
    const rows = allDrivers.map((d) => [
      d.driverCode,
      d.fullName,
      d.phone,
      d.nationalId,
      d.licenseNumber,
      d.status,
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drivers-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('drivers.title')}
        description={t('drivers.page_description')}
        actions={
          <PageHeaderActions
            exportDisabled={(driversQuery.data?.items?.length ?? 0) === 0}
            onExportCsv={exportToCsv}
            createHref={ROUTES.driversNew}
            createLabel={t('drivers.new_driver')}
            canCreate={canCreateDriver}
          />
        }
      />

      <SummaryCards
        cards={summaryCards}
        isLoading={driversQuery.isLoading}
      />

      <AdvancedFilters
        variant="card"
        showSearchButton
        fields={[
          { type: 'search', key: 'search', label: t('filters.search'), placeholder: t('drivers.search_placeholder') },
          { type: 'select', key: 'status', label: t('common.status'), options: [
            { value: 'ACTIVE', label: t('filters.active') },
            { value: 'IN_TRIP', label: t('common_statuses.in_trip') },
            { value: 'INACTIVE', label: t('filters.inactive') },
            { value: 'SUSPENDED', label: t('filters.suspended') },
          ], placeholder: t('filters.all_statuses'), disabled: !!filters.availableOnly },
          { type: 'checkbox', key: 'availableOnly', label: t('filters.available'), checkboxLabel: t('filters.available_only') },
        ]}
        values={filters as Record<string, string | boolean | undefined>}
        onChange={(key, value) => {
          if (key === 'availableOnly' && value) {
            setFilter('status', undefined);
          }
          setFilter(key as keyof typeof DEFAULT_FILTERS, value as any);
        }}
        onReset={resetFilters}
      />

      <DataTableWrapper
        query={driversQuery}
        columns={driverColumns}
        hideExport
        filterChips={filterChips}
        onFilterChipRemove={(key) => setFilter(key as keyof typeof DEFAULT_FILTERS, undefined)}
        onFilterChipsClear={resetFilters}
        emptyTitle={hasActiveFilters ? t('drivers.no_drivers_filtered') : t('drivers.no_drivers')}
        emptyDescription={
          hasActiveFilters
            ? t('drivers.no_drivers_filtered_desc')
            : t('drivers.no_drivers_desc')
        }
        emptyAction={!hasActiveFilters && canCreateDriver ? (
          <Link href={ROUTES.driversNew} className={buttonVariants({ variant: 'primary' })}>
            <Plus className="size-4" />
            {t('drivers.new_driver')}
          </Link>
        ) : undefined}
        errorTitle={t('drivers.load_error')}
        onPageChange={(p) => setFilter('page', p)}
        onLimitChange={(l) => setFilter('limit', l)}
      />
    </PageSection>
  );
}
