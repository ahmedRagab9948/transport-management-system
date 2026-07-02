'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, ClipboardList, Database, FileText, Truck, UserCheck, Users, MapPin } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { buttonVariants } from '@/components/ui/button';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { ChartDatePresets, EmptyState, FilterDateRange, GlassCard, PageHeader, PageSection, SummaryCards } from '@/components/shared';
import type { SummaryCard } from '@/components/shared';
import type { BaseStatCardTrend } from '@/components/shared';
import Link from 'next/link';
import { useT } from '@/lib/i18n';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import {
  useDashboardSummary, useDriverStatusDistribution, useMonthlyTrips,
  useRecentActivity, useSystemAlerts, useTripsStatus, useVehicleUtilization,
} from '../hooks/use-dashboard';
import dynamic from 'next/dynamic';
import { DashboardWidgets } from './dashboard-widgets';
import { QuickActions } from './quick-actions';
import { RecentActivity } from './recent-activity';
import { SystemAlerts } from './system-alerts';

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
    <div className="flex items-center gap-2">
      <ChartDatePresets
        value={{ from: dateFrom, to: dateTo }}
        onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
      />
      <FilterDateRange
        fromValue={dateFrom}
        toValue={dateTo}
        onFromChange={setDateFrom}
        onToChange={setDateTo}
        fromLabel={t('common.from')}
        toLabel={t('common.to')}
        variant="bar"
      />
    </div>
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

  const monthlyCounts = monthlyTrips.data?.map((r) => r.count) ?? [];
  const sparklineFromMonthly = monthlyCounts.length >= 2 ? monthlyCounts : undefined;

  const summaryCards: SummaryCard[] = useMemo(() => {
    function makeSparkline(base: number, trend: BaseStatCardTrend, points = 8): number[] {
      const dir = trend.isPositive ? 1 : -1;
      const seed = base * (1 + dir * 0.15);
      const arr: number[] = [];
      for (let i = 0; i < points; i++) {
        const progress = i / (points - 1);
        const trendVal = base * (1 + dir * 0.15 * progress);
        const noise = seed * (Math.sin(i * 2.3) * 0.04 + Math.cos(i * 1.7) * 0.04);
        arr.push(Math.max(0, Math.round(trendVal + noise)));
      }
      return arr;
    }

    return [
      { label: t('dashboard.total_trips'), value: summary.data?.totalTrips ?? 0, subtitle: t('dashboard.total_trips_subtitle'), icon: <Truck className="size-4" />, className: 'kpi-blue', trend: mockTrends[0], sparklineData: sparklineFromMonthly },
      { label: t('dashboard.active_trips'), value: summary.data?.activeTrips ?? 0, subtitle: t('dashboard.active_trips_subtitle'), icon: <ClipboardList className="size-4" />, className: 'kpi-cyan', trend: mockTrends[1], sparklineData: makeSparkline(summary.data?.activeTrips ?? 100, mockTrends[1]) },
      { label: t('dashboard.available_vehicles'), value: summary.data?.availableVehicles ?? 0, subtitle: t('dashboard.available_vehicles_subtitle'), icon: <Car className="size-4" />, className: 'kpi-emerald', trend: mockTrends[2], sparklineData: makeSparkline(summary.data?.availableVehicles ?? 50, mockTrends[2]) },
      { label: t('dashboard.active_drivers'), value: summary.data?.activeDrivers ?? 0, subtitle: t('dashboard.active_drivers_subtitle'), icon: <UserCheck className="size-4" />, className: 'kpi-amber', trend: mockTrends[3], sparklineData: makeSparkline(summary.data?.activeDrivers ?? 80, mockTrends[3]) },
      { label: t('contracts.title'), value: summary.data?.activeContracts ?? 0, subtitle: t('dashboard.active_contracts_subtitle'), icon: <FileText className="size-4" />, className: 'kpi-purple', trend: mockTrends[4], sparklineData: makeSparkline(summary.data?.activeContracts ?? 30, mockTrends[4]) },
      { label: t('clients.title'), value: summary.data?.activeClients ?? 0, subtitle: t('dashboard.active_clients_subtitle'), icon: <Users className="size-4" />, className: 'kpi-rose', trend: mockTrends[5], sparklineData: makeSparkline(summary.data?.activeClients ?? 40, mockTrends[5]) },
    ];
  }, [summary.data, monthlyTrips.data, t]);

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader title={t('dashboard.title')}
        description={t('nav.welcome_back', { name: user?.fullName ?? 'User' })} actions={dateRangeActions} />
      {isEmpty ? (
        <OnboardingEmptyState summary={summary.data} />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
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
          <DashboardWidgets />
          <PageSection variant="grid2">
            <RecentActivity data={recentActivity.data} isLoading={recentActivity.isLoading} />
            <SystemAlerts data={systemAlerts.data} isLoading={systemAlerts.isLoading} />
          </PageSection>
          </motion.div>
        </>
      )}
    </PageSection>
  );
}
