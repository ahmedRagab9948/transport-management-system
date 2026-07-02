'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Database, Inbox, SearchX, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { slideUp, staggerContainer, staggerContainerFast } from '@/lib/design/animation';
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
  variant?: 'default' | 'search' | 'permissions' | 'data';
}

const variantIcons: Record<string, LucideIcon> = {
  search: SearchX,
  permissions: ShieldX,
  data: Database,
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  action,
  className,
  iconClassName,
  variant = 'default',
}: EmptyStateProps) {
  const ResolvedIcon = Icon ?? variantIcons[variant] ?? Inbox;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card/40 px-6 py-10 text-center shadow-sm dark:bg-card/20 sm:px-8 sm:py-12 lg:px-24 lg:py-16',
        className,
      )}
    >
      <motion.div
        variants={staggerContainerFast}
        className={cn(
          'mb-6 sm:mb-8 flex size-24 sm:size-32 items-center justify-center rounded-full bg-gradient-to-b from-primary/10 to-primary/5 shadow-sm ring-1 ring-border/40 dark:from-primary/15 dark:to-primary/5 dark:ring-border/30',
          iconClassName,
        )}
      >
        <ResolvedIcon className="size-10 sm:size-14 text-muted-foreground/80 stroke-[1.2]" aria-hidden />
      </motion.div>
      <motion.h3 variants={slideUp} className="text-2xl font-semibold tracking-tight text-foreground">{title}</motion.h3>
      {description ? (
        <motion.p variants={slideUp} className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground/80 dark:text-muted-foreground/70">
          {description}
        </motion.p>
      ) : null}
      {actionLabel && onAction ? (
        <motion.div variants={slideUp}>
          <Button type="button" size="lg" className="mt-8 shadow-sm transition-all hover:shadow-md" onClick={onAction}>
            {actionLabel}
          </Button>
        </motion.div>
      ) : null}
      {action ? <motion.div variants={slideUp} className="mt-8">{action}</motion.div> : null}
    </motion.div>
  );
}
