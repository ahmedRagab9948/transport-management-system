'use client';

import { Plus, Truck, Play, CheckCircle2, XCircle } from 'lucide-react';
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
import { tripsQueryKeys, useTripVehicles, useTripDrivers, useTripClients, useTrips } from '../hooks/use-trips';
import { tripsService } from '../services/trips.service';
import type { TripStatus } from '../types/trip.types';
import { useTripColumns } from './trip-table-columns';

const DEFAULT_FILTERS = {
  search: undefined as string | undefined,
  status: undefined as TripStatus | undefined,
  clientId: undefined as string | undefined,
  driverId: undefined as string | undefined,
  vehicleId: undefined as string | undefined,
  dateFrom: undefined as string | undefined,
  dateTo: undefined as string | undefined,
  page: undefined as string | undefined,
  limit: undefined as string | undefined,
};

const FILTER_CHIPS = [
  { key: 'status', labelKey: 'common.status' },
  { key: 'clientId', labelKey: 'clients.title', hideValue: true },
  { key: 'driverId', labelKey: 'drivers.title', hideValue: true },
  { key: 'vehicleId', labelKey: 'vehicles.title', hideValue: true },
  { key: 'dateFrom', labelKey: 'trips.start_date' },
  { key: 'dateTo', labelKey: 'trips.end_date' },
  { key: 'search', labelKey: 'common.search' },
];

export function TripsListPage() {
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const canCreateTrip = hasPermission(PERMISSIONS.CREATE_TRIP);

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
    namespace: 'trips',
  });

  const { data: vehicles = [] } = useTripVehicles();
  const { data: drivers = [] } = useTripDrivers();
  const { data: clients = [] } = useTripClients();

  const STATUSES: Array<{ value: TripStatus; label: string }> = [
    { value: 'DRAFT', label: t('common_statuses.draft') },
    { value: 'PENDING', label: t('common_statuses.pending') },
    { value: 'ASSIGNED', label: t('common_statuses.assigned') },
    { value: 'DRIVER_CONFIRMED', label: t('common_statuses.driver_confirmed') },
    { value: 'LOADING', label: t('common_statuses.loading') },
    { value: 'ON_ROUTE', label: t('common_statuses.on_route') },
    { value: 'WAITING', label: t('common_statuses.waiting') },
    { value: 'UNLOADING', label: t('common_statuses.unloading') },
    { value: 'COMPLETED', label: t('common_statuses.completed') },
    { value: 'CANCELLED', label: t('common_statuses.cancelled') },
  ];

  const tripsQuery = useTrips(queryParams);

  const summaryQuery = useQuery({
    queryKey: tripsQueryKeys.summary,
    queryFn: async () => {
      const res = await tripsService.getTrips({ page: 1, limit: 99999 });
      return res.items;
    },
    staleTime: 30 * 1000,
  });
  const allTrips = summaryQuery.data ?? [];
  const summaryCards = [
    { label: t('common.total'), value: tripsQuery.data?.meta?.total ?? 0, icon: <Truck className="size-4" />, className: 'kpi-blue' },
    { label: t('common_statuses.pending'), value: allTrips.filter((t) => t.status === 'PENDING').length, icon: <Play className="size-4" />, className: 'kpi-amber' },
    { label: t('common_statuses.on_route'), value: allTrips.filter((t) => t.status === 'ON_ROUTE').length, icon: <Play className="size-4" />, className: 'kpi-cyan' },
    { label: t('common_statuses.completed'), value: allTrips.filter((t) => t.status === 'COMPLETED').length, icon: <CheckCircle2 className="size-4" />, className: 'kpi-emerald' },
    { label: t('common_statuses.cancelled'), value: allTrips.filter((t) => t.status === 'CANCELLED').length, icon: <XCircle className="size-4" />, className: 'kpi-rose' },
  ];

  const tripColumns = useTripColumns();

  async function exportToCsv() {
    const response = await tripsService.getTrips({ page: 1, limit: 99999 });
    const allTrips = response.items;
    const headers = ['tripNumber', 'clientId', 'startDate', 'driver', 'plate', 'toLocation', 'status'];
    const rows = allTrips.map((trip) => [
      trip.tripNumber,
      trip.clientId ?? '-',
      trip.startDate ?? '-',
      trip.driver?.fullName ?? '-',
      trip.vehicle?.plates?.[0]?.plateNumber ?? trip.vehicle?.vehicleCode ?? '-',
      trip.toLocation,
      trip.status,
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('trips.title')}
        description={t('trips.page_description')}
        actions={
          <PageHeaderActions
            exportDisabled={(tripsQuery.data?.items?.length ?? 0) === 0}
            onExportCsv={exportToCsv}
            createHref={ROUTES.tripsNew}
            createLabel={t('trips.new_trip')}
            canCreate={canCreateTrip}
          />
        }
      />

      <SummaryCards
        cards={summaryCards}
        isLoading={tripsQuery.isLoading}
      />

      <AdvancedFilters
        variant="card"
        showSearchButton
        fields={[
          { type: 'search', key: 'search', label: t('trips.search'), placeholder: t('trips.search_placeholder') },
          { type: 'select', key: 'clientId', label: t('clients.title'), options: clients.map((c) => ({ value: c.id, label: c.companyName })), placeholder: t('filters.all_clients') },
          { type: 'select', key: 'driverId', label: t('drivers.title'), options: drivers.map((d) => ({ value: d.id, label: d.fullName })), placeholder: t('filters.all_drivers') },
          { type: 'select', key: 'vehicleId', label: t('vehicles.title'), options: vehicles.map((v) => ({ value: v.id, label: v.vehicleCode })), placeholder: t('filters.all_vehicles') },
          { type: 'select', key: 'status', label: t('common.status'), options: STATUSES, placeholder: t('filters.all_statuses') },
          { type: 'date-range', key: 'date', fromLabel: t('trips.start_date'), toLabel: t('trips.end_date'), dateFromKey: 'dateFrom', dateToKey: 'dateTo' },
        ]}
        values={filters as Record<string, string | boolean | undefined>}
        onChange={(key, value) => setFilter(key as keyof typeof DEFAULT_FILTERS, value)}
        onReset={resetFilters}
      />

      <DataTableWrapper
        query={tripsQuery}
        columns={tripColumns}
        hideExport
        filterChips={filterChips}
        onFilterChipRemove={(key) => setFilter(key as keyof typeof DEFAULT_FILTERS, undefined)}
        onFilterChipsClear={resetFilters}
        emptyTitle={hasActiveFilters ? t('trips.no_trips_filtered') : t('trips.no_trips')}
        emptyDescription={
          hasActiveFilters
            ? t('trips.no_trips_filtered_desc')
            : t('trips.no_trips_desc')
        }
        emptyAction={!hasActiveFilters && canCreateTrip ? (
          <Link href={ROUTES.tripsNew} className={buttonVariants({ variant: 'primary' })}>
            <Plus className="size-4" />
            {t('trips.new_trip')}
          </Link>
        ) : undefined}
        errorTitle={t('trips.load_error')}
        onPageChange={(p) => setFilter('page', p)}
        onLimitChange={(l) => setFilter('limit', l)}
      />
    </PageSection>
  );
}
