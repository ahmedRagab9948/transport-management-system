'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import {
  DataTableShell,
  EmptyState,
  GlassCard,
  LoadingSkeleton,
  PageHeader,
  PageSection,
} from '@/components/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { useT } from '@/lib/i18n';
import { PERMISSIONS } from '@/constants/permissions';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useAuditLogs } from '../hooks/use-audit-logs';
import type { AuditLog } from '../types/audit-log.types';
import { DiffViewer } from './diff-viewer';

const ENTITY_TYPE_COLORS: Record<string, string> = {
  vehicle: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  driver: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  trip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  client: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  contract: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  auth: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
};

function EntityTypeBadge({ type }: { type: string }) {
  const colorClass = ENTITY_TYPE_COLORS[type.toLowerCase()] ?? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {type}
    </span>
  );
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function AuditLogsPage() {
  const { t, locale } = useT();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      entityType: entityType || undefined,
    }),
    [page, search, entityType],
  );

  const auditLogsQuery = useAuditLogs(queryParams);
  const logs = auditLogsQuery.data?.items ?? [];
  const meta = auditLogsQuery.data?.meta ?? { page, limit, total: 0, totalPages: 0 };

  const canView = hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS);

  const columns: ColumnDef<AuditLog, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'createdAt',
        header: t('audit_logs.timestamp'),
        cell: ({ row }) => (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {formatDate(row.original.createdAt, locale)}
          </span>
        ),
      },
      {
        id: 'entityType',
        header: t('audit_logs.entity'),
        cell: ({ row }) => <EntityTypeBadge type={row.original.entityType} />,
      },
      {
        accessorKey: 'action',
        header: t('audit_logs.action'),
        cell: ({ row }) => {
          const actionKey = `audit_logs.actions.${row.original.action}`;
          const actionLabel = t(actionKey);
          return (
            <span className="font-medium text-xs">{actionLabel !== actionKey ? actionLabel : row.original.action.replace(/_/g, ' ')}</span>
          );
        },
      },
      {
        id: 'user',
        header: t('audit_logs.performed_by'),
        cell: ({ row }) =>
          row.original.user ? (
            <span className="text-xs">{row.original.user.fullName}</span>
          ) : (
            <span className="text-xs text-muted-foreground">{t('audit_logs.system')}</span>
          ),
      },
      {
        id: 'changes',
        header: t('audit_logs.details_header'),
        cell: ({ row }) => (
          <DiffViewer
            oldValues={row.original.oldValues}
            newValues={row.original.newValues}
          />
        ),
      },
    ],
    [t, locale],
  );

  if (!canView) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('audit_logs.title')} description={t('common.unauthorized')} />
      </PageSection>
    );
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('audit_logs.title')}
        description={t('audit_logs.description')}
      />

      <GlassCard variant="surface" className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t('filters.search_placeholder')}
                className="ps-8"
              />
            </div>
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <option value="">{t('audit_logs.entity_all')}</option>
              <option value="trip">{t('entities.trip')}</option>
              <option value="vehicle">{t('entities.vehicle')}</option>
              <option value="driver">{t('entities.driver')}</option>
              <option value="client">{t('entities.client')}</option>
              <option value="contract">{t('entities.contract')}</option>
              <option value="auth">{t('audit_logs.entity_auth')}</option>
            </select>
          </div>

          {auditLogsQuery.isLoading ? (
            <LoadingSkeleton variant="table" />
          ) : auditLogsQuery.error ? (
            <EmptyState
              icon={AlertCircle}
              title={t('errors.load_failed')}
              actionLabel={t('common.retry')}
              onAction={() => void auditLogsQuery.refetch()}
              className="border-0 bg-transparent"
            />
          ) : (
            <>
              <DataTableShell
                columns={columns}
                data={logs}
                isLoading={auditLogsQuery.isFetching && !auditLogsQuery.isLoading}
                searchPlaceholder={t('filters.search_placeholder')}
                emptyTitle={t('audit_logs.no_logs')}
                emptyDescription={t('audit_logs.no_logs_desc')}
              />

              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {t('common.page')} {meta.page} {t('common.of')} {meta.totalPages} ({t('common.total')} {meta.total})
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      {t('common.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </GlassCard>
    </PageSection>
  );
}
