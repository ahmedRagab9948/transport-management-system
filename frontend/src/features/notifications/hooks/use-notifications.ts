import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { notificationsService } from '../services/notifications.service';
import type { PaginatedNotificationsResponse } from '../types/notification.types';

export const notificationsQueryKeys = {
  all: ['notifications'] as const,
  list: (params?: Record<string, unknown>) => ['notifications', 'list', params] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

function usePollingInterval(baseInterval: number): number | false {
  const enabledRef = useRef(true);

  useEffect(() => {
    function onVisibilityChange() {
      enabledRef.current = document.visibilityState === 'visible';
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return enabledRef.current ? baseInterval : false;
}

export function useNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
  return useQuery({
    queryKey: notificationsQueryKeys.list(params),
    queryFn: () => notificationsService.getNotifications(params),
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUnreadCount() {
  const refetchInterval = usePollingInterval(30_000);

  return useQuery({
    queryKey: notificationsQueryKeys.unreadCount,
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval,
    staleTime: 10_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      notificationsService.markAsRead(notificationIds),
    onMutate: async (notificationIds) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.all });
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.unreadCount });

      const previousUnread = queryClient.getQueryData<number>(notificationsQueryKeys.unreadCount);
      queryClient.setQueryData(notificationsQueryKeys.unreadCount, Math.max(0, (previousUnread ?? 0) - notificationIds.length));

      const previousLists = new Map<string, PaginatedNotificationsResponse>();
      queryClient.getQueriesData<PaginatedNotificationsResponse>({ queryKey: ['notifications', 'list'] }).forEach(([key, data]) => {
        if (data?.items) {
          previousLists.set(JSON.stringify(key), data);
          queryClient.setQueryData(key, {
            ...data,
            items: data.items.map((n: any) =>
              notificationIds.includes(n.id) ? { ...n, readAt: new Date().toISOString() } : n,
            ),
          });
        }
      });

      return { previousUnread, previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(notificationsQueryKeys.unreadCount, context.previousUnread);
      }
      if (context?.previousLists) {
        context.previousLists.forEach((data, key) => {
          queryClient.setQueryData(JSON.parse(key), data);
        });
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadCount });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.all });
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.unreadCount });

      const previousUnread = queryClient.getQueryData<number>(notificationsQueryKeys.unreadCount);
      queryClient.setQueryData(notificationsQueryKeys.unreadCount, 0);

      const previousLists = new Map<string, PaginatedNotificationsResponse>();
      queryClient.getQueriesData<PaginatedNotificationsResponse>({ queryKey: ['notifications', 'list'] }).forEach(([key, data]) => {
        if (data?.items) {
          previousLists.set(JSON.stringify(key), data);
          queryClient.setQueryData(key, {
            ...data,
            items: data.items.map((n: any) => ({ ...n, readAt: new Date().toISOString() })),
          });
        }
      });

      return { previousUnread, previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(notificationsQueryKeys.unreadCount, context.previousUnread);
      }
      if (context?.previousLists) {
        context.previousLists.forEach((data, key) => {
          queryClient.setQueryData(JSON.parse(key), data);
        });
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadCount });
    },
  });
}
