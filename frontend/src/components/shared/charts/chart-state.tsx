'use client';

import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChartStateProps {
  variant: 'loading' | 'empty' | 'error';
  icon?: LucideIcon;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  height?: string;
}

export const ChartState = memo(function ChartState({
  variant,
  icon: Icon,
  message,
  actionLabel,
  onAction,
  className,
  height = 'h-52 sm:h-64',
}: ChartStateProps) {
  if (variant === 'loading') {
    return (
      <div className={cn('flex items-center justify-center', height, className)}>
        <div className="h-36 sm:h-48 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const DefaultIcon = variant === 'error' ? AlertCircle : Inbox;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40 bg-muted/20',
        height,
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-lg bg-muted/50">
        {Icon ? <Icon className="size-5 text-muted-foreground" /> : <DefaultIcon className="size-5 text-muted-foreground" />}
      </div>
      {message ? (
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="ghost" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
});
