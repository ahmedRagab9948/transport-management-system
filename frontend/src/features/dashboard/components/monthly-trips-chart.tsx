'use client';

import { Activity } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GlassCard, SectionHeader } from '@/components/shared';
import { CARD_BODY } from '@/components/shared/design-system/design-tokens';
import { useT } from '@/lib/i18n';
import type { MonthlyTripCount } from '../types/dashboard.types';

interface MonthlyTripsChartProps {
  data: MonthlyTripCount[] | undefined;
  isLoading: boolean;
}

export function MonthlyTripsChart({ data, isLoading }: MonthlyTripsChartProps) {
  const { t } = useT();
  const chartRef = useRef<HTMLDivElement>(null);
  const [showChart, setShowChart] = useState(false);

  useLayoutEffect(() => {
    if (data && data.length > 0 && chartRef.current) {
      const { width, height } = chartRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) setShowChart(true);
    } else {
      setShowChart(false);
    }
  }, [data]);

  return (
    <GlassCard variant="surface">
      <SectionHeader title={t('dashboard.monthly_trips')} />
      <div className={CARD_BODY}>
        {isLoading ? (
          <div className="flex h-52 sm:h-64 items-center justify-center">
            <div className="h-36 sm:h-48 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex h-52 sm:h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40 bg-muted/20">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted/50">
              <Activity className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t('dashboard.no_monthly_data')}</p>
          </div>
        ) : (
          <div ref={chartRef} className="h-[200px] sm:h-[256px] lg:h-[320px]">
          {showChart && <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid hsl(var(--border) / 0.5)',
                  background: 'hsl(var(--card))',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: 13,
                  padding: '12px',
                }}
                wrapperStyle={{ backdropFilter: 'blur(8px)' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#monthlyGradient)"
                dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
