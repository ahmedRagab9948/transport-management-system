'use client';

import { useMemo, useState } from 'react';
import { Car, ClipboardList, Database, FileText, Truck, UserCheck, Users, MapPin } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { EmptyState, FilterDateRange, GlassCard, PageHeader, PageSection, SummaryCards } from '@/components/shared';
import type { SummaryCard } from '@/components/shared';
import type { BaseStatCardTrend } from '@/components/shared';
import Link from 'next/link';
import { PERMISSIONS } from '@/constants/permissions';
import { useT } from '@/lib/i18n';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import {
  useDashboardSummary, useDriverStatusDistribution, useMonthlyTrips,
  useRecentActivity, useSystemAlerts, useTripsStatus, useVehicleUtilization,
} from '../hooks/use-dashboard';
import dynamic from 'next/dynamic';
import { QuickActions } from './quick-actions';
import { RecentActivity } from './recent-activity';
import { SystemAlerts } from './system-alerts';
import { SystemStatsCard } from './system-stats-card';

const MonthlyTripsChart = dynamic(() => import('./monthly-trips-chart').then(m => m.MonthlyTripsChart), { ssr: false, loading: () => null });
const TripStatusChart = dynamic(() => import('./trip-status-chart').then(m => m.TripStatusChart), { ssr: false, loading: () => null });
const VehicleDriverCharts = dynamic(() => import('./vehicle-driver-charts').then(m => m.VehicleDriverCharts), { ssr: false, loading: () => null });

function OnboardingEmptyState({ summary }: { summary: { totalTrips: number; availableVehicles: number; activeDrivers: number } }) {
  const { t } = useT();
  return (
    <GlassCard variant="floating" className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="rounded-lg bg-muted/50 p-4">
        <Database className="size-10 text-muted-foreground" />
      </div>
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold">{t('dashboard.onboarding_title')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('dashboard.onboarding_description')}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {summary.availableVehicles === 0 && (
          <Link href="/vehicles/new" className={buttonVariants({ variant: 'outline' })}>
            <Truck className="size-4 ms-2" /> {t('dashboard.add_vehicle')}
          </Link>
        )}
        {summary.activeDrivers === 0 && (
          <Link href="/drivers/new" className={buttonVariants({ variant: 'outline' })}>
            <Users className="size-4 ms-2" /> {t('dashboard.add_driver')}
          </Link>
        )}
        {summary.totalTrips === 0 && (
          <Link href="/trips/new" className={buttonVariants({ variant: 'outline' })}>
            <MapPin className="size-4 ms-2" /> {t('dashboard.create_trip')}
          </Link>
        )}
      </div>
    </GlassCard>
  );
}

function useDefaultDateRange() {
  return useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return {
      from: thirtyDaysAgo.toISOString().slice(0, 10),
      to: today.toISOString().slice(0, 10),
    };
  }, []);
}

export function DashboardPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { t } = useT();
  const defaultRange = useDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const summary = useDashboardSummary();
  const tripsStatus = useTripsStatus();
  const monthlyTrips = useMonthlyTrips();
  const vehicleUtilization = useVehicleUtilization();
  const driverStatus = useDriverStatusDistribution();
  const recentActivity = useRecentActivity();
  const systemAlerts = useSystemAlerts();

  const dateRangeActions = (
    <FilterDateRange
      fromValue={dateFrom}
      toValue={dateTo}
      onFromChange={setDateFrom}
      onToChange={setDateTo}
      fromLabel={t('common.from')}
      toLabel={t('common.to')}
      variant="bar"
    />
  );

  const hasError = summary.error || tripsStatus.error || monthlyTrips.error
    || vehicleUtilization.error || driverStatus.error || recentActivity.error || systemAlerts.error;

  if (hasError) {
    const message = getApiErrorMessage(
      summary.error ?? tripsStatus.error ?? monthlyTrips.error,
      t('dashboard.loading_error'),
    );

    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} actions={dateRangeActions} />
        <GlassCard variant="surface" className="p-6">
          <EmptyState icon={Database} title={t('dashboard.loading_error')}
            description={message} actionLabel={t('dashboard.retry')}
            onAction={() => { void summary.refetch(); void tripsStatus.refetch(); void monthlyTrips.refetch(); void vehicleUtilization.refetch(); void driverStatus.refetch(); void recentActivity.refetch(); void systemAlerts.refetch(); }}
            className="border-0 bg-transparent" />
        </GlassCard>
      </PageSection>
    );
  }

  const isReady = summary.data;
  const isEmpty = isReady && summary.data.totalTrips === 0 && summary.data.availableVehicles === 0 && summary.data.activeDrivers === 0;

  const mockTrends: BaseStatCardTrend[] = [
    { value: 12.4, isPositive: true, label: t('common.vs_last_month') },
    { value: 8.2, isPositive: true, label: t('common.vs_last_month') },
    { value: 5.1, isPositive: false, label: t('common.vs_last_month') },
    { value: 15.3, isPositive: true, label: t('common.vs_last_month') },
    { value: 3.7, isPositive: true, label: t('common.vs_last_month') },
    { value: 9.8, isPositive: true, label: t('common.vs_last_month') },
  ];

  const summaryCards: SummaryCard[] = [
    { label: t('dashboard.total_trips'), value: summary.data?.totalTrips ?? 0, icon: <Truck className="size-4" />, className: 'kpi-blue', trend: mockTrends[0] },
    { label: t('dashboard.active_trips'), value: summary.data?.activeTrips ?? 0, icon: <ClipboardList className="size-4" />, className: 'kpi-cyan', trend: mockTrends[1] },
    { label: t('dashboard.available_vehicles'), value: summary.data?.availableVehicles ?? 0, icon: <Car className="size-4" />, className: 'kpi-emerald', trend: mockTrends[2] },
    { label: t('dashboard.active_drivers'), value: summary.data?.activeDrivers ?? 0, icon: <UserCheck className="size-4" />, className: 'kpi-amber', trend: mockTrends[3] },
    { label: t('contracts.title'), value: summary.data?.activeContracts ?? 0, icon: <FileText className="size-4" />, className: 'kpi-purple', trend: mockTrends[4] },
    { label: t('clients.title'), value: summary.data?.activeClients ?? 0, icon: <Users className="size-4" />, className: 'kpi-rose', trend: mockTrends[5] },
  ];

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader title={t('dashboard.title')}
        description={t('nav.welcome_back', { name: user?.fullName ?? 'User' })} actions={dateRangeActions} />
      {isEmpty ? (
        <OnboardingEmptyState summary={summary.data} />
      ) : (
        <>
          <SummaryCards cards={summaryCards} isLoading={summary.isLoading} />
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TripStatusChart data={tripsStatus.data} isLoading={tripsStatus.isLoading} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
          <MonthlyTripsChart data={monthlyTrips.data} isLoading={monthlyTrips.isLoading} />
          <VehicleDriverCharts vehicleData={vehicleUtilization.data} driverData={driverStatus.data}
            vehicleLoading={vehicleUtilization.isLoading} driverLoading={driverStatus.isLoading} />
          <PageSection variant="grid2">
            <RecentActivity data={recentActivity.data} isLoading={recentActivity.isLoading} />
            <SystemAlerts data={systemAlerts.data} isLoading={systemAlerts.isLoading} />
          </PageSection>
          {hasPermission(PERMISSIONS.MANAGE_ROLES) && (
            <PageSection variant="grid2">
              <SystemStatsCard />
            </PageSection>
          )}
        </>
      )}
    </PageSection>
  );
}
