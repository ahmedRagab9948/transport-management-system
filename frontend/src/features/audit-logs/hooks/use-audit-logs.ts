import { QUERY_KEYS } from '@tms/shared';
import { useQuery } from '@tanstack/react-query';
import { auditLogsService } from '../services/audit-logs.service';
import type { AuditLogsQueryParams } from '../types/audit-log.types';

export const auditLogsQueryKeys = {
  all: [QUERY_KEYS.AUDIT_LOGS] as const,
  list: (params: AuditLogsQueryParams) => [QUERY_KEYS.AUDIT_LOGS, 'list', params] as const,
  entityHistory: (entityType: string, entityId: string) =>
    [QUERY_KEYS.AUDIT_LOGS, 'entity', entityType, entityId] as const,
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
