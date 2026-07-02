'use client';

import { memo, useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard, ChartState, ChartTooltip } from '@/components/shared';
import { useT } from '@/lib/i18n';
import type { MonthlyTripCount } from '../types/dashboard.types';

interface MonthlyTripsChartProps {
  data: MonthlyTripCount[] | undefined;
  isLoading: boolean;
}

export const MonthlyTripsChart = memo(function MonthlyTripsChart({ data, isLoading }: MonthlyTripsChartProps) {
  const { t } = useT();
  const chartRef = useRef<HTMLDivElement>(null);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (data && data.length > 0 && chartRef.current) {
      const { width, height } = chartRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) setShowChart(true);
    } else {
      setShowChart(false);
    }
  }, [data]);

  return (
    <ChartCard title={t('dashboard.monthly_trips')}>
      {isLoading ? (
        <ChartState variant="loading" />
      ) : !data || data.length === 0 ? (
        <ChartState variant="empty" message={t('dashboard.no_monthly_data')} />
      ) : (
        <div ref={chartRef} className="h-[200px] sm:h-[256px] lg:h-[320px]">
        {showChart && <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} role="img" aria-label={t('dashboard.monthly_trips_chart_aria')}>
            <defs>
              <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} horizontal={true} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
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
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#monthlyGradient)"
              dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>}
          <details className="mt-2 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium">{t('common.view_data_table')}</summary>
            <table className="mt-1 w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="py-1 pe-4 font-medium">{t('common.month')}</th>
                  <th className="py-1 font-medium">{t('common.count')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.month} className="border-b border-border/20">
                    <td className="py-1 pe-4">{row.month}</td>
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
