'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { useNotifications, useMarkAsRead } from '@/features/notifications/hooks/use-notifications';
import { getNotificationConfig, getNotificationLink } from '@/features/notifications/constants/notification-type.config';

export default function NotificationsPage() {
  const { t } = useT();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 20;
  const notificationsQuery = useNotifications({ page, limit });
  const markRead = useMarkAsRead();

  const notifications = notificationsQuery.data?.items ?? [];
  const meta = notificationsQuery.data?.meta;
  const isLoading = notificationsQuery.isLoading;

  function handleNotificationClick(notification: { id: string; entityType: string | null; entityId: string | null }) {
    markRead.mutate([notification.id]);
    const link = getNotificationLink(notification.entityType, notification.entityId);
    if (link) {
      router.push(link);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <AppBreadcrumbs />
      <PageHeader
        title={t('common.notifications')}
        description={
          meta
            ? t('pagination.showing_results', { from: 1, to: meta.total, total: meta.total })
            : undefined
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t('common.no_notifications')}
          description={t('common.all_caught_up')}
        />
      ) : (
        <>
          <div className="space-y-1" role="list" aria-label={t('common.notifications')}>
            {notifications.map((n) => {
              const config = getNotificationConfig(n.type);
              const Icon = config.icon;

              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border p-4 text-start transition-colors hover:bg-muted/40',
                    !n.readAt && 'border-primary/20 bg-primary/5',
                  )}
                  role="listitem"
                  aria-label={`${n.title}${n.message ? `: ${n.message}` : ''}`}
                >
                  <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', config.bgColor)} aria-hidden="true">
                    <Icon className={cn('size-5', config.color)} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{n.title}</span>
                      <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                        {n.createdAt}
                      </span>
                    </div>
                    {n.message ? (
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                    ) : null}
                  </div>
                  {!n.readAt ? (
                    <span className="mt-1.5 flex size-2 shrink-0 rounded-full bg-primary" aria-label={t('common.unread')} />
                  ) : null}
                </button>
              );
            })}
          </div>

          {meta && meta.totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4 rtl:rotate-180" />
                {t('common.previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('pagination.page_info', { current: page, total: Math.max(meta.totalPages, 1) })}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('common.next')}
                <ChevronRight className="size-4 rtl:rotate-180" />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
