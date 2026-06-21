'use client';

import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface DetailsLayoutProps {
  title: string;
  subtitle?: string;
  editHref?: string;
  backHref?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  statusBadge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DetailsLayout({
  title,
  subtitle,
  editHref,
  backHref,
  children,
  isLoading,
  statusBadge,
  actions,
}: DetailsLayoutProps) {
  const router = useRouter();
  const { t, isRTL } = useT();

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(backHref ?? '..')}
            aria-label={t('common.back')}
            className="mt-1 shrink-0"
          >
            {isRTL ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
          </Button>
          <div className="min-w-0">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                {subtitle ? <Skeleton className="h-4 w-48" /> : null}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight truncate">{title}</h1>
                  {statusBadge}
                </div>
                {subtitle ? (
                  <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                ) : null}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {editHref ? (
            <Button type="button" onClick={() => router.push(editHref)} size="sm">
              <Pencil className="size-4" />
              {t('common.edit')}
            </Button>
          ) : null}
        </div>
      </div>
      </div>

      {/* Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium">
        {value ?? <span className="text-muted-foreground">-</span>}
      </dd>
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailSection({ title, children, className }: DetailSectionProps) {
  return (
    <div className={cn('rounded-lg border border-border/60 bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-sm', className)}>
      <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>
      </div>
    </div>
  );
}
