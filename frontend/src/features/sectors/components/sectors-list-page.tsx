'use client';

import { Plus, MapPin, CheckCircle2, Ban } from 'lucide-react';
import Link from 'next/link';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { AdvancedFilters, DataTableWrapper, PageHeader, PageHeaderActions, PageSection, SummaryCards } from '@/components/shared';
import { buttonVariants } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useEntityFilters } from '@/components/shared/hooks/use-entity-filters';
import { useQuery } from '@tanstack/react-query';
import { useSectors } from '../hooks/use-sectors';
import { sectorsService } from '../services/sectors.service';
import type { SectorStatus } from '../types/sector.types';
import { useSectorColumns } from './sector-table-columns';
import { downloadCsv } from '@/lib/csv-export';

const DEFAULT_FILTERS = {
  search: undefined as string | undefined,
  status: undefined as SectorStatus | undefined,
  page: undefined as string | undefined,
  limit: undefined as string | undefined,
};

const FILTER_CHIPS = [
  { key: 'status', labelKey: 'common.status' },
  { key: 'search', labelKey: 'common.search' },
];

export function SectorsListPage() {
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const canCreateSector = hasPermission(PERMISSIONS.CREATE_SECTOR);
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
    namespace: 'sectors',
  });

  const sectorsQuery = useSectors(queryParams);

  const summaryQuery = useQuery({
    queryKey: ['sectors-summary'],
    queryFn: async () => {
      const res = await sectorsService.getSectors({ page: 1, limit: 99999 });
      return res.items;
    },
    staleTime: 5 * 60 * 1000,
  });
  const allSectors = summaryQuery.data ?? [];
  const summaryCards = [
    { label: t('common.total'), value: sectorsQuery.data?.meta?.total ?? 0, icon: <MapPin className="size-4" />, className: 'kpi-blue' },
    { label: t('common_statuses.active'), value: allSectors.filter((s) => s.status === 'ACTIVE').length, icon: <CheckCircle2 className="size-4" />, className: 'kpi-emerald' },
    { label: t('common_statuses.inactive'), value: allSectors.filter((s) => s.status === 'INACTIVE').length, icon: <Ban className="size-4" />, className: 'kpi-rose' },
  ];

  const sectorColumns = useSectorColumns();

  async function exportToCsv() {
    const response = await sectorsService.getSectors({ page: 1, limit: 99999 });
    const allSectors = response.items;
    const headers = ['name', 'code', 'subSectors', 'status', 'createdAt'];
    const rows = allSectors.map((s) => [
      s.name,
      s.code,
      String(s._count.subSectors),
      s.status,
      s.createdAt,
    ]);
    downloadCsv(headers, rows, `sectors-export-${new Date().toISOString().split('T')[0]}.csv`);
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('sectors.title')}
        description={t('sectors.page_description')}
        actions={
          <PageHeaderActions
            exportDisabled={(sectorsQuery.data?.items?.length ?? 0) === 0}
            onExportCsv={exportToCsv}
            createHref={ROUTES.sectorsNew}
            createLabel={t('sectors.new_sector')}
            canCreate={canCreateSector}
          />
        }
      />

      <SummaryCards
        cards={summaryCards}
        isLoading={sectorsQuery.isLoading}
      />

      <AdvancedFilters
        variant="card"
        showSearchButton
        fields={[
          { type: 'search', key: 'search', label: t('filters.search'), placeholder: t('sectors.search_placeholder') },
          { type: 'select', key: 'status', label: t('common.status'), options: [
            { value: 'ACTIVE', label: t('filters.active') },
            { value: 'INACTIVE', label: t('filters.inactive') },
          ], placeholder: t('filters.all_statuses') },
        ]}
        values={filters as Record<string, string | boolean | undefined>}
        onChange={(key, value) => {
          setFilter(key as keyof typeof DEFAULT_FILTERS, value as any);
        }}
        onReset={resetFilters}
      />

      <DataTableWrapper
        query={sectorsQuery}
        columns={sectorColumns}
        hideExport
        filterChips={filterChips}
        onFilterChipRemove={(key) => setFilter(key as keyof typeof DEFAULT_FILTERS, undefined)}
        onFilterChipsClear={resetFilters}
        emptyTitle={hasActiveFilters ? t('sectors.no_sectors_filtered') : t('sectors.no_sectors')}
        emptyDescription={
          hasActiveFilters
            ? t('sectors.no_sectors_filtered_desc')
            : t('sectors.no_sectors_desc')
        }
        emptyAction={!hasActiveFilters && canCreateSector ? (
          <Link href={ROUTES.sectorsNew} className={buttonVariants({ variant: 'primary' })}>
            <Plus className="size-4" />
            {t('sectors.new_sector')}
          </Link>
        ) : undefined}
        errorTitle={t('sectors.load_error')}
        onPageChange={(p) => setFilter('page', p)}
        onLimitChange={(l) => setFilter('limit', l)}
      />
    </PageSection>
  );
}
