'use client';

import { useMemo } from 'react';
import { DollarSign, Target, Truck, Users, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const ChartCard = dynamic(() => import('@/components/shared/charts').then(m => m.ChartCard), { ssr: false, loading: () => null });
const BarChartWidget = dynamic(() => import('@/components/shared/charts').then(m => m.BarChartWidget), { ssr: false, loading: () => null });
const LineChartWidget = dynamic(() => import('@/components/shared/charts').then(m => m.LineChartWidget), { ssr: false, loading: () => null });
const PieChartWidget = dynamic(() => import('@/components/shared/charts').then(m => m.PieChartWidget), { ssr: false, loading: () => null });
import { useT } from '@/lib/i18n';
import { useRevenueAnalytics, useTripCompletion, useVehicleUtilization, useDriverUtilization, useMonthlyKpis } from '../hooks/use-reports';
import { ReportKpiCard } from './report-kpi-card';

const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  quinary: 'hsl(var(--chart-5))',
};

function formatCurrency(value: number, locale: string) {
  const currency = locale === 'ar' ? 'EGP' : 'EGP';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value}%`;
}

export function OverviewTab() {
  const { t, locale } = useT();
  const revenueQuery = useRevenueAnalytics({ period: 'monthly' });
  const tripCompletionQuery = useTripCompletion({});
  const vehicleUtilQuery = useVehicleUtilization({});
  const driverUtilQuery = useDriverUtilization({});
  const monthlyKpisQuery = useMonthlyKpis({});

  const isLoading =
    revenueQuery.isLoading ||
    tripCompletionQuery.isLoading ||
    vehicleUtilQuery.isLoading ||
    driverUtilQuery.isLoading ||
    monthlyKpisQuery.isLoading;

  const monthlyChartData = useMemo(() => {
    return (revenueQuery.data?.monthlyRevenue ?? []).map((m) => ({
      month: m.month,
      revenue: m.revenue,
      trips: m.trips,
    }));
  }, [revenueQuery.data]);

  const tripStatusData = useMemo(() => {
    return (tripCompletionQuery.data?.statusDistribution ?? []).map((s) => ({
      name: t(`common_statuses.${s.status.toLowerCase()}`),
      value: s.count,
    }));
  }, [tripCompletionQuery.data, t]);

  const vehicleStatusData = useMemo(() => {
    return (monthlyKpisQuery.data?.currentVehicleStatus ?? []).map((s) => ({
      name: t(`common_statuses.${s.status.toLowerCase()}`),
      value: s.count,
    }));
  }, [monthlyKpisQuery.data, t]);

  const driverStatusData = useMemo(() => {
    return (monthlyKpisQuery.data?.currentDriverStatus ?? []).map((s) => ({
      name: t(`common_statuses.${s.status.toLowerCase()}`),
      value: s.count,
    }));
  }, [monthlyKpisQuery.data, t]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportKpiCard
          title={t('reports.total_revenue')}
          value={formatCurrency(revenueQuery.data?.totalRevenue ?? 0, locale)}
          subtitle={`${revenueQuery.data?.totalTrips ?? 0} ${t('reports.trips').toLowerCase()}`}
          icon={<DollarSign className="size-5" />}
          isLoading={isLoading}
        />
        <ReportKpiCard
          title={t('reports.avg_revenue_per_trip')}
          value={formatCurrency(revenueQuery.data?.averageRevenue ?? 0, locale)}
          icon={<DollarSign className="size-5" />}
          isLoading={isLoading}
        />
        <ReportKpiCard
          title={t('reports.completion_rate')}
          value={formatPercent(tripCompletionQuery.data?.completionRate ?? 0)}
          subtitle={`${tripCompletionQuery.data?.completed ?? 0}/${tripCompletionQuery.data?.total ?? 0} ${t('common_statuses.completed').toLowerCase()}`}
          icon={<Target className="size-5" />}
          trend={
            (tripCompletionQuery.data?.completionRate ?? 0) >= 70
              ? 'up'
              : (tripCompletionQuery.data?.completionRate ?? 0) >= 40
                ? 'neutral'
                : 'down'
          }
          trendValue={formatPercent(tripCompletionQuery.data?.completionRate ?? 0)}
        />
        <ReportKpiCard
          title={t('reports.cancellation_rate')}
          value={formatPercent(tripCompletionQuery.data?.cancellationRate ?? 0)}
          icon={<XCircle className="size-5" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportKpiCard
          title={t('reports.vehicle_utilization')}
          value={formatPercent(vehicleUtilQuery.data?.utilizationRate ?? 0)}
          subtitle={`${vehicleUtilQuery.data?.utilizedVehicles ?? 0}/${vehicleUtilQuery.data?.totalVehicles ?? 0} ${t('entities.vehicle')}s`}
          icon={<Truck className="size-5" />}
        />
        <ReportKpiCard
          title={t('reports.driver_utilization')}
          value={formatPercent(driverUtilQuery.data?.utilizationRate ?? 0)}
          subtitle={`${driverUtilQuery.data?.utilizedDrivers ?? 0}/${driverUtilQuery.data?.totalDrivers ?? 0} ${t('entities.driver')}s`}
          icon={<Users className="size-5" />}
        />
        <ReportKpiCard
          title={t('reports.active_vehicles')}
          value={
            monthlyKpisQuery.data?.currentVehicleStatus.find(
              (s) => s.status === 'ACTIVE',
            )?.count ?? 0
          }
          subtitle={t('reports.currently_operational')}
          icon={<Truck className="size-5" />}
        />
        <ReportKpiCard
          title={t('reports.active_drivers')}
          value={
            monthlyKpisQuery.data?.currentDriverStatus.find(
              (s) => s.status === 'ACTIVE',
            )?.count ?? 0
          }
          subtitle={t('reports.currently_available')}
          icon={<Users className="size-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={t('reports.monthly_revenue')} description={`${t('reports.revenue')} ${t('common.and')} ${t('reports.trips').toLowerCase()} ${t('reports.monthly_trip_volume').toLowerCase()}`}>
          <BarChartWidget
            data={monthlyChartData}
            xKey="month"
            bars={[
              { key: 'revenue', color: CHART_COLORS.primary, name: t('reports.revenue') },
            ]}
          />
        </ChartCard>

        <ChartCard title={t('reports.monthly_trip_volume')}>
          <LineChartWidget
            data={monthlyChartData}
            xKey="month"
            lines={[
              { key: 'trips', color: CHART_COLORS.secondary, name: t('reports.trips') },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title={t('reports.trip_status_distribution')}>
          <PieChartWidget data={tripStatusData} />
        </ChartCard>

        <ChartCard title={t('reports.vehicle_status')}>
          <PieChartWidget data={vehicleStatusData} />
        </ChartCard>

        <ChartCard title={t('reports.driver_status')}>
          <PieChartWidget data={driverStatusData} />
        </ChartCard>
      </div>
    </div>
  );
}


