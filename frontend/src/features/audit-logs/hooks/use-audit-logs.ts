import { useQuery } from '@tanstack/react-query';
import { auditLogsService } from '../services/audit-logs.service';
import type { AuditLogsQueryParams } from '../types/audit-log.types';

export const auditLogsQueryKeys = {
  all: ['audit-logs'] as const,
  list: (params: AuditLogsQueryParams) => ['audit-logs', 'list', params] as const,
  entityHistory: (entityType: string, entityId: string) =>
    ['audit-logs', 'entity', entityType, entityId] as const,
};

export function useAuditLogs(params: AuditLogsQueryParams = {}) {
  return useQuery({
    queryKey: auditLogsQueryKeys.list(params),
    queryFn: () => auditLogsService.getAuditLogs(params),
  });
}

export function useEntityAuditLogs(entityType: string, entityId: string) {
  return useQuery({
    queryKey: auditLogsQueryKeys.entityHistory(entityType, entityId),
    queryFn: () => auditLogsService.getEntityHistory(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}
