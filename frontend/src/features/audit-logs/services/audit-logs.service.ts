import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';
import type { AuditLog, AuditLogsQueryParams, PaginatedAuditLogsResponse } from '../types/audit-log.types';

export const auditLogsService = {
  async getAuditLogs(params: AuditLogsQueryParams = {}): Promise<PaginatedAuditLogsResponse> {
    const response = await apiClient.get('/audit-logs', { params });
    return unwrapApiResponse<PaginatedAuditLogsResponse>(response);
  },

  async getEntityHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
    const response = await apiClient.get(`/audit-logs/${entityType}/${entityId}`);
    return unwrapApiResponse<AuditLog[]>(response);
  },
};
