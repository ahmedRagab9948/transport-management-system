'use client';

import { Clock, User } from 'lucide-react';
import { StatusBadge, EmptyState } from '@/components/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { TripStatusHistory, TripStatus } from '../types/trip.types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-400',
  ASSIGNED: 'bg-blue-500',
  IN_PROGRESS: 'bg-amber-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-red-500',
};

interface TripTimelineProps {
  history: TripStatusHistory[];
  isLoading?: boolean;
}

export function TripTimeline({ history, isLoading }: TripTimelineProps) {
  const { t, locale } = useT();
  const formatDateTime = (value: string) => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(value));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-3 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title={t('trips.timeline_empty_title')}
        description={t('trips.timeline_empty_description')}
        className="border-0 bg-transparent"
      />
    );
  }

  return (
    <div className="relative space-y-0">
      {history.map((entry, index) => {
        const isLast = index === history.length - 1;
        return (
          <div key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn('size-3 rounded-md ring-2 ring-background', STATUS_COLORS[entry.newStatus] ?? 'bg-gray-400')} />
              {!isLast ? <div className="mt-1 w-px flex-1 bg-border" /> : null}
            </div>
            <div className={cn('flex-1 pb-6', isLast ? 'pb-0' : '')}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  {entry.oldStatus ? (
                    <>{t(`common_statuses.${entry.oldStatus.toLowerCase()}`)} <ArrowRightIcon className="mx-1 inline size-3" /> </>
                  ) : null}
                  {t(`common_statuses.${entry.newStatus.toLowerCase()}`)}
                </span>
                <StatusBadge status={entry.newStatus} domain="trip" />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDateTime(entry.changedAt)}
                </span>
                {entry.changedBy ? (
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3" />
                    {entry.changedBy.fullName}
                  </span>
                ) : null}
                {entry.reasonCode ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs uppercase">
                    {entry.reasonCode.replace(/_/g, ' ')}
                  </span>
                ) : null}
              </div>
              {entry.notes ? (
                <p className="mt-1.5 text-xs text-muted-foreground italic">{entry.notes}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className, 'rtl:-scale-x-100')}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
