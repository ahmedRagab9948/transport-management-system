'use client';

import { PieChart as PieChartIcon } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { GlassCard, SectionHeader } from '@/components/shared';
import { CARD_BODY } from '@/components/shared/design-system/design-tokens';
import { useT } from '@/lib/i18n';
import type { StatusCount } from '../types/dashboard.types';

interface VehicleDriverChartsProps {
  vehicleData: StatusCount[] | undefined;
  driverData: StatusCount[] | undefined;
  vehicleLoading: boolean;
  driverLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e',
  IN_TRIP: '#3b82f6',
  IN_MAINTENANCE: '#f59e0b',
  OUT_OF_SERVICE: '#ef4444',
  MAINTENANCE: '#f59e0b',
  AVAILABLE: '#22c55e',
  BUSY: '#3b82f6',
  PENDING: '#6b7280',
  INACTIVE: '#6b7280',
  SUSPENDED: '#ef4444',
  ASSIGNED: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
  DRAFT: '#6b7280',
};

function getColor(status: string): string {
  return STATUS_COLORS[status.toUpperCase().replace(/\s+/g, '_')] ?? '#6b7280';
}

function getStatusTranslationKey(status: string): string {
  return `common_statuses.${status.toLowerCase().replace(/\s+/g, '_')}`;
}

interface DonutChartProps {
  data: StatusCount[] | undefined;
  isLoading: boolean;
  title: string;
  emptyLabel: string;
}

function DonutChart({ data, isLoading, title, emptyLabel }: DonutChartProps) {
  const { t } = useT();
  const chartData = (data ?? []).map((d) => ({
    name: t(getStatusTranslationKey(d.status)),
    value: d.count,
    color: getColor(d.status),
  }));

  return (
    <GlassCard variant="surface" className="flex-1">
      <SectionHeader title={title} />
      <div className={CARD_BODY}>
        {isLoading ? (
          <div className="flex h-48 sm:h-56 items-center justify-center">
            <div className="size-32 sm:size-40 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-48 sm:h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40 bg-muted/20">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted/50">
              <PieChartIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{emptyLabel}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-[200px] sm:h-[224px] lg:h-[260px] w-full max-w-[200px] sm:max-w-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={96}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              {chartData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full shadow-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground capitalize">{entry.name}</span>
                  <span className="ms-auto font-medium tabular-nums">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function VehicleDriverCharts({
  vehicleData,
  driverData,
  vehicleLoading,
  driverLoading,
}: VehicleDriverChartsProps) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <DonutChart
        data={vehicleData}
        isLoading={vehicleLoading}
        title={t('dashboard.vehicle_status')}
        emptyLabel={t('dashboard.no_vehicle_data')}
      />
      <DonutChart
        data={driverData}
        isLoading={driverLoading}
        title={t('dashboard.driver_status')}
        emptyLabel={t('dashboard.no_driver_data')}
      />
    </div>
  );
}
