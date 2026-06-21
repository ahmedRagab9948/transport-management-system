export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string | null;
  type: string;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface PaginatedNotificationsResponse {
  items: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
