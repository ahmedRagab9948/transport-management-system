'use client';

import { AlertCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { EmptyState } from './empty-state';
import { LoadingSkeleton } from './loading-skeleton';

export interface DataFetchShellProps {
  isLoading: boolean;
  error?: string | null;
  errorTitle?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function DataFetchShell({ isLoading, error, errorTitle, onRetry, children }: DataFetchShellProps) {
  const { t } = useT();

  if (isLoading) {
    return <LoadingSkeleton variant="table" />;
  }

  if (error) {
    return (
      <div className="rounded-md border bg-card p-6">
        <EmptyState
          icon={AlertCircle}
          title={errorTitle || t('common.error')}
          description={error}
          actionLabel={t('common.retry')}
          onAction={onRetry}
          className="border-0 bg-transparent"
        />
      </div>
    );
  }

  return <>{children}</>;
}
