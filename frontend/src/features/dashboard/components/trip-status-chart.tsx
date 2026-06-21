'use client';

import { BarChart2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GlassCard, SectionHeader } from '@/components/shared';
import { CARD_BODY } from '@/components/shared/design-system/design-tokens';
import { useT } from '@/lib/i18n';
import type { StatusCount } from '../types/dashboard.types';

interface TripStatusChartProps {
  data: StatusCount[] | undefined;
  isLoading: boolean;
}

const STATUS_BAR_COLORS: Record<string, string> = {
  PENDING: 'oklch(0.708 0.02 240)',
  ASSIGNED: 'oklch(0.546 0.245 262.881)',
  IN_PROGRESS: 'oklch(0.769 0.188 70.08)',
  COMPLETED: 'oklch(0.627 0.194 149.214)',
  CANCELLED: 'oklch(0.577 0.245 27.325)',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'common_statuses.pending',
  ASSIGNED: 'common_statuses.assigned',
  IN_PROGRESS: 'common_statuses.in_progress',
  COMPLETED: 'common_statuses.completed',
  CANCELLED: 'common_statuses.cancelled',
};

export function TripStatusChart({ data, isLoading }: TripStatusChartProps) {
  const { t } = useT();
  const chartData = (data ?? []).map((d) => ({
    name: t(STATUS_LABELS[d.status] ?? d.status),
    count: d.count,
    fill: STATUS_BAR_COLORS[d.status] ?? 'hsl(var(--primary))',
  }));

  return (
    <GlassCard variant="surface">
      <SectionHeader title={t('dashboard.trips_by_status')} />
      <div className={CARD_BODY}>
        {isLoading ? (
          <div className="flex h-52 sm:h-64 items-center justify-center">
            <div className="h-36 sm:h-48 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-52 sm:h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40 bg-muted/20">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted/50">
              <BarChart2 className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t('dashboard.no_trip_data')}</p>
          </div>
        ) : (
          <div className="h-[200px] sm:h-[256px] lg:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} />
              <XAxis
                dataKey="name"
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
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
