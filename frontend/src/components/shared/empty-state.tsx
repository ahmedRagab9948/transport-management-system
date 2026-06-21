import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  action,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card/40 px-6 py-10 text-center shadow-sm dark:bg-card/20 sm:px-8 sm:py-12 lg:px-24 lg:py-16',
        className,
      )}
    >
      <div
        className={cn(
          'mb-6 sm:mb-8 flex size-24 sm:size-32 items-center justify-center rounded-full bg-gradient-to-b from-primary/10 to-primary/5 shadow-sm ring-1 ring-border/40 dark:from-primary/15 dark:to-primary/5 dark:ring-border/30',
          iconClassName,
        )}
      >
        <Icon className="size-10 sm:size-14 text-muted-foreground/80 stroke-[1.2]" aria-hidden />
      </div>
      <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
      {description ? (
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground/80 dark:text-muted-foreground/70">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button type="button" size="lg" className="mt-8 shadow-sm transition-all hover:shadow-md" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}
