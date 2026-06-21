import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';
import type { Notification, PaginatedNotificationsResponse } from '../types/notification.types';

export const notificationsService = {
  async getNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
    const response = await apiClient.get('/notifications', { params });
    return unwrapApiResponse<PaginatedNotificationsResponse>(response);
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/notifications/unread-count');
    return unwrapApiResponse<number>(response);
  },

  async markAsRead(notificationIds: string[]) {
    const response = await apiClient.patch('/notifications/mark-read', { notificationIds });
    return unwrapApiResponse(response);
  },

  async markAllAsRead() {
    const response = await apiClient.post('/notifications/mark-all-read');
    return unwrapApiResponse(response);
  },
};
