'use client';

import { useT } from '@/lib/i18n';
import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import { resolveStatusTone, type StatusTone } from '@/constants/statuses';
import { cn } from '@/lib/utils';

const toneVariants = cva('border-0', {
  variants: {
    tone: {
      neutral: 'bg-muted text-muted-foreground [&_span:first-child]:bg-muted-foreground',
      info: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 [&_span:first-child]:bg-indigo-500',
      warning: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 [&_span:first-child]:bg-amber-500',
      success: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 [&_span:first-child]:bg-emerald-500',
      danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 [&_span:first-child]:bg-rose-500',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
});

export interface StatusBadgeProps extends VariantProps<typeof toneVariants> {
  status: string;
  domain?: 'trip' | 'vehicle' | 'driver' | 'client' | 'contract';
  label?: string;
  className?: string;
}

export function StatusBadge({ status, domain = 'trip', label, tone, className }: StatusBadgeProps) {
  const { t } = useT();
  const resolvedTone: StatusTone = tone ?? resolveStatusTone(status, domain);

  const statusKey = `common_statuses.${status.toLowerCase().replace(/\s+/g, '_')}`;
  const translated = t(statusKey);
  const display = label ?? (translated !== statusKey ? translated : status.replace(/_/g, ' '));

  return (
    <Badge variant="outline" className={cn(toneVariants({ tone: resolvedTone }), cn(
      'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium',
      className,
    ))}>
      <span className="size-1.5 rounded-full shrink-0" />
      {display}
    </Badge>
  );
}
