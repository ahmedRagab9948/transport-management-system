'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard, ChartState, ChartTooltip } from '@/components/shared';
import { useT } from '@/lib/i18n';
import type { StatusCount } from '../types/dashboard.types';

interface TripStatusChartProps {
  data: StatusCount[] | undefined;
  isLoading: boolean;
}

const STATUS_BAR_COLORS: Record<string, string> = {
  DRAFT: 'oklch(0.708 0.02 240)',
  PENDING: 'oklch(0.708 0.02 240)',
  ASSIGNED: 'oklch(0.546 0.245 262.881)',
  DRIVER_CONFIRMED: 'oklch(0.546 0.245 262.881)',
  LOADING: 'oklch(0.769 0.188 70.08)',
  ON_ROUTE: 'oklch(0.769 0.188 70.08)',
  WAITING: 'oklch(0.769 0.188 70.08)',
  UNLOADING: 'oklch(0.769 0.188 70.08)',
  COMPLETED: 'oklch(0.627 0.194 149.214)',
  CANCELLED: 'oklch(0.577 0.245 27.325)',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'common_statuses.draft',
  PENDING: 'common_statuses.pending',
  ASSIGNED: 'common_statuses.assigned',
  DRIVER_CONFIRMED: 'common_statuses.driver_confirmed',
  LOADING: 'common_statuses.loading',
  ON_ROUTE: 'common_statuses.on_route',
  WAITING: 'common_statuses.waiting',
  UNLOADING: 'common_statuses.unloading',
  COMPLETED: 'common_statuses.completed',
  CANCELLED: 'common_statuses.cancelled',
};

export const TripStatusChart = memo(function TripStatusChart({ data, isLoading }: TripStatusChartProps) {
  const { t } = useT();
  const chartRef = useRef<HTMLDivElement>(null);
  const [showChart, setShowChart] = useState(false);
  const chartData = useMemo(() => (data ?? []).map((d) => ({
    name: t(STATUS_LABELS[d.status] ?? d.status),
    count: d.count,
    fill: STATUS_BAR_COLORS[d.status] ?? 'hsl(var(--primary))',
  })), [data, t]);

  useEffect(() => {
    if (chartData.length > 0 && chartRef.current) {
      const { width, height } = chartRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) setShowChart(true);
    } else {
      setShowChart(false);
    }
  }, [chartData]);

  return (
    <ChartCard title={t('dashboard.trips_by_status')}>
        {isLoading ? (
          <ChartState variant="loading" />
        ) : chartData.length === 0 ? (
          <ChartState variant="empty" message={t('dashboard.no_trip_data')} />
        ) : (
          <div ref={chartRef} className="h-[200px] sm:h-[256px] lg:h-[320px]">
          {showChart && <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} role="img" aria-label={t('dashboard.trips_by_status_chart_aria')}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} horizontal={true} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={chartData.length > 6 ? -45 : 0}
                textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                height={chartData.length > 6 ? 60 : 30}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>}
            <details className="mt-2 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium">{t('common.view_data_table')}</summary>
              <table className="mt-1 w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="py-1 pe-4 font-medium">{t('common.status')}</th>
                    <th className="py-1 font-medium">{t('common.count')}</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.name} className="border-b border-border/20">
                      <td className="py-1 pe-4">{row.name}</td>
                      <td className="py-1">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        )}
    </ChartCard>
  );
});
