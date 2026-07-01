'use client';

import { Activity, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { GlassCard, SectionHeader, StatusBadge } from '@/components/shared';
import { CARD_BODY } from '@/components/shared/design-system/design-tokens';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { RecentActivity as RecentActivityType } from '../types/dashboard.types';

interface RecentActivityProps {
  data: RecentActivityType | undefined;
  isLoading: boolean;
}

const DOT_COLORS: Record<string, string> = {
  trip: 'bg-blue-500',
  contract: 'bg-indigo-500',
  vehicle: 'bg-amber-500',
};

function formatRelativeTime(dateString: string, t: (key: string, params?: Record<string, string | number>) => string) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return t('common.just_now');
  if (diffMins < 60) return t('common.minutes_ago', { count: diffMins });
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return t('common.hours_ago', { count: diffHours });
  const diffDays = Math.floor(diffHours / 24);
  return t('common.days_ago', { count: diffDays });
}

export function RecentActivity({ data, isLoading }: RecentActivityProps) {
  const { t } = useT();
  return (
    <GlassCard variant="surface">
      <SectionHeader title={t('dashboard.recent_activity')} icon={Activity} />
      <div className={CARD_BODY}>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        ) : !data ||
          (data.recentTrips.length === 0 &&
            data.recentContracts.length === 0 &&
            data.recentVehicleChanges.length === 0) ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            {t('dashboard.no_recent_activity')}
          </div>
        ) : (
          <div className="relative space-y-0">
            <div className="absolute left-[7px] top-2 h-[calc(100%-20px)] w-px bg-border/40" aria-hidden="true" />
            {data.recentTrips.map((trip) => (
              <div key={trip.id} className="group relative flex gap-4 pb-5 last:pb-0 hover:bg-muted/30 rounded-lg -mx-2 px-2 py-2 transition-colors duration-200">
                <span className={cn('relative z-10 mt-2 size-2 shrink-0 rounded-full ring-2 ring-background', DOT_COLORS.trip)} />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-foreground">{trip.tripNumber}</span>
                    <span className="ms-2 text-muted-foreground">
                      {trip.fromLocation} → {trip.toLocation}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={trip.status} domain="trip" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(trip.createdAt, t)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {data.recentContracts.map((contract) => (
              <div key={contract.id} className="group relative flex gap-4 pb-5 last:pb-0 hover:bg-muted/30 rounded-lg -mx-2 px-2 py-2 transition-colors duration-200">
                <span className={cn('relative z-10 mt-2 size-2 shrink-0 rounded-full ring-2 ring-background', DOT_COLORS.contract)} />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-foreground">{contract.contractNumber}</span>
                    <span className="ms-2 text-muted-foreground">
                      {contract.title} — {contract.client.companyName}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={contract.status} domain="contract" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(contract.updatedAt, t)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {data.recentVehicleChanges.map((change) => (
              <div key={change.id} className="group relative flex gap-4 pb-5 last:pb-0 hover:bg-muted/30 rounded-lg -mx-2 px-2 py-2 transition-colors duration-200">
                <span className={cn('relative z-10 mt-2 size-2 shrink-0 rounded-full ring-2 ring-background', DOT_COLORS.vehicle)} />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-foreground">{change.vehicle.vehicleCode}</span>
                    <span className="text-muted-foreground">
                      {' '}{change.oldStatus ?? '—'} → {change.newStatus.replace(/_/g, ' ')}
                    </span>
                    {change.changedBy ? (
                      <span className="ms-2 text-xs text-muted-foreground">
                        {t('common.changed_by', { name: change.changedBy.fullName })}
                      </span>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(change.changedAt, t)}
                  </span>
                </div>
              </div>
            ))}
            <Link
              href="/audit-logs"
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t('common.view_all')}
              <ExternalLink className="size-3" />
            </Link>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
