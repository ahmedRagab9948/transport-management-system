'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useT } from '@/lib/i18n';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useT();

  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <AlertCircle className="size-12 text-destructive" />
      <h1 className="text-2xl font-bold tracking-tight">{t('errors.something_went_wrong')}</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error.message || t('errors.unexpected_error')}
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <RefreshCw className="size-4" />
        {t('common.retry')}
      </button>
    </div>
  );
}
