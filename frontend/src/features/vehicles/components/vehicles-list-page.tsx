'use client';

import { Plus, Truck, Wrench, Ban, CheckCircle2 } from 'lucide-react';
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
import { useVehicles } from '../hooks/use-vehicles';
import { vehiclesService } from '../services/vehicles.service';
import type { VehicleStatus, VehicleType } from '../types/vehicle.types';
import { useVehicleColumns } from './vehicle-table-columns';

const DEFAULT_FILTERS = {
  search: undefined as string | undefined,
  vehicleType: undefined as VehicleType | undefined,
  status: undefined as VehicleStatus | undefined,
  availableOnly: undefined as boolean | undefined,
  page: undefined as string | undefined,
  limit: undefined as string | undefined,
};

const FILTER_CHIPS = [
  { key: 'vehicleType', labelKey: 'vehicles.vehicle_type' },
  { key: 'status', labelKey: 'common.status' },
  { key: 'availableOnly', labelKey: 'filters.available', hideValue: true },
  { key: 'search', labelKey: 'common.search' },
];

export function VehiclesListPage() {
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const canCreateVehicle = hasPermission(PERMISSIONS.CREATE_VEHICLE);
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
    namespace: 'vehicles',
  });

  const vehiclesQuery = useVehicles(queryParams);

  const summaryQuery = useQuery({
    queryKey: ['vehicles-summary'],
    queryFn: async () => {
      const res = await vehiclesService.getVehicles({ page: 1, limit: 99999 });
      return res.items;
    },
    staleTime: 5 * 60 * 1000,
  });
  const allVehicles = summaryQuery.data ?? [];
  const summaryCards = [
    { label: t('common.total'), value: vehiclesQuery.data?.meta?.total ?? 0, icon: <Truck className="size-4" />, className: 'kpi-blue' },
    { label: t('common_statuses.active'), value: allVehicles.filter((v) => v.status === 'ACTIVE').length, icon: <CheckCircle2 className="size-4" />, className: 'kpi-emerald' },
    { label: t('common_statuses.in_maintenance'), value: allVehicles.filter((v) => v.status === 'IN_MAINTENANCE').length, icon: <Wrench className="size-4" />, className: 'kpi-amber' },
    { label: t('common_statuses.out_of_service'), value: allVehicles.filter((v) => v.status === 'OUT_OF_SERVICE').length, icon: <Ban className="size-4" />, className: 'kpi-rose' },
  ];

  const vehicleColumns = useVehicleColumns();

  async function exportToCsv() {
    const response = await vehiclesService.getVehicles({ page: 1, limit: 99999 });
    const allVehicles = response.items;
    const headers = ['vehicleCode', 'manufacturer', 'model', 'productionYear', 'plateNumber', 'status'];
    const rows = allVehicles.map((v) => [
      v.vehicleCode,
      v.manufacturer ?? '-',
      v.model ?? '-',
      v.productionYear != null ? String(v.productionYear) : '-',
      v.plates?.[0]?.plateNumber ?? '-',
      v.status,
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicles-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('vehicles.title')}
        description={t('vehicles.page_description')}
        actions={
          <PageHeaderActions
            exportDisabled={(vehiclesQuery.data?.items?.length ?? 0) === 0}
            onExportCsv={exportToCsv}
            createHref={ROUTES.vehiclesNew}
            createLabel={t('vehicles.new_vehicle')}
            canCreate={canCreateVehicle}
          />
        }
      />

      <SummaryCards
        cards={summaryCards}
        isLoading={vehiclesQuery.isLoading}
      />

      <AdvancedFilters
        variant="card"
        showSearchButton
        fields={[
          { type: 'search', key: 'search', label: t('filters.search'), placeholder: t('vehicles.search_placeholder') },
          { type: 'select', key: 'vehicleType', label: t('vehicles.vehicle_type'), options: [
            { value: 'TRAILER', label: t('vehicles.type_trailer') },
            { value: 'JUMBO', label: t('vehicles.type_jumbo') },
          ], placeholder: t('filters.all_types') },
          { type: 'select', key: 'status', label: t('common.status'), options: [
            { value: 'ACTIVE', label: t('filters.active') },
            { value: 'IN_TRIP', label: t('common_statuses.in_trip') },
            { value: 'IN_MAINTENANCE', label: t('filters.in_maintenance') },
            { value: 'OUT_OF_SERVICE', label: t('filters.out_of_service') },
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
        query={vehiclesQuery}
        columns={vehicleColumns}
        hideExport
        filterChips={filterChips}
        onFilterChipRemove={(key) => setFilter(key as keyof typeof DEFAULT_FILTERS, undefined)}
        onFilterChipsClear={resetFilters}
        emptyTitle={hasActiveFilters ? t('vehicles.no_vehicles_filtered') : t('vehicles.no_vehicles')}
        emptyDescription={
          hasActiveFilters
            ? t('vehicles.no_vehicles_filtered_desc')
            : t('vehicles.no_vehicles_desc')
        }
        emptyAction={!hasActiveFilters && canCreateVehicle ? (
          <Link href={ROUTES.vehiclesNew} className={buttonVariants({ variant: 'primary' })}>
            <Plus className="size-4" />
            {t('vehicles.new_vehicle')}
          </Link>
        ) : undefined}
        errorTitle={t('vehicles.load_error')}
        onPageChange={(p) => setFilter('page', p)}
        onLimitChange={(l) => setFilter('limit', l)}
      />
    </PageSection>
  );
}
