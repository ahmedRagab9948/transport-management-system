export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface AuditLogsQueryParams {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
  userId?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface PaginatedAuditLogsResponse {
  items: AuditLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
