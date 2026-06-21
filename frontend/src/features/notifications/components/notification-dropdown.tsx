'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../hooks/use-notifications';
import { getNotificationConfig, getNotificationLink } from '../constants/notification-type.config';

function formatRelativeTime(dateString: string, t: (key: string, params?: Record<string, string | number>) => string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('common.just_now');
  if (mins < 60) return t('common.minutes_ago', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('common.hours_ago', { count: hours });
  const days = Math.floor(hours / 24);
  return t('common.days_ago', { count: days });
}

export function NotificationDropdown() {
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const unreadQuery = useUnreadCount();
  const notificationsQuery = useNotifications({ limit: 10 });
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const unreadCount = unreadQuery.data ?? 0;
  const notifications = notificationsQuery.data?.items ?? [];
  const isLoading = notificationsQuery.isLoading || unreadQuery.isLoading;

  function handleNotificationClick(notification: { id: string; entityType: string | null; entityId: string | null }) {
    markRead.mutate([notification.id]);
    const link = getNotificationLink(notification.entityType, notification.entityId);
    if (link) {
      router.push(link);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t('common.notifications')}>
            <div className="relative">
              <Bell className="size-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1.5 -end-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground"
                  aria-label={t('notifications.unread_count', { count: unreadCount })}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-sm font-medium">{t('common.notifications')}</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-xs text-primary hover:underline"
            >
              {t('common.mark_all_read')}
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-1 px-4 py-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
              <Bell className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t('common.no_notifications')}</p>
            </div>
          ) : (
            notifications.map((n) => {
              const config = getNotificationConfig(n.type);
              const Icon = config.icon;

              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b px-4 py-2.5 text-start transition-colors hover:bg-muted/40',
                    !n.readAt && 'bg-primary/5',
                  )}
                >
                  <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', config.bgColor)}>
                    <Icon className={cn('size-4', config.color)} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{n.title}</span>
                      <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                        {formatRelativeTime(n.createdAt, t)}
                      </span>
                    </div>
                    {n.message ? (
                      <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.message}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t px-4 py-2 text-center">
          <button
            type="button"
            onClick={() => router.push('/notifications')}
            className="text-xs text-primary hover:underline"
          >
            {t('common.view_all')}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
