'use client';

import { DollarSign, TrendingUp, Target, Truck, Users, Briefcase, BarChart3 } from 'lucide-react';

import { GlassCard } from '@/components/shared';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isLoading?: boolean;
}

const KPI_ICONS = {
  revenue: <DollarSign className="size-5" />,
  completion: <Target className="size-5" />,
  utilization: <TrendingUp className="size-5" />,
  vehicles: <Truck className="size-5" />,
  drivers: <Users className="size-5" />,
  contracts: <Briefcase className="size-5" />,
  trips: <BarChart3 className="size-5" />,
} as const;

export function ReportKpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  isLoading = false,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <GlassCard variant="surface" className="flex items-center gap-4 p-6">
          <div className="flex size-10 animate-pulse items-center justify-center rounded-full bg-muted" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="surface" className="flex items-center gap-4 p-6">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex flex-1 flex-col">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold">{value}</span>
            {trend && trendValue ? (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' && 'text-emerald-600',
                  trend === 'down' && 'text-destructive',
                  trend === 'neutral' && 'text-muted-foreground',
                )}
              >
                {trendValue}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          ) : null}
        </div>
    </GlassCard>
  );
}
