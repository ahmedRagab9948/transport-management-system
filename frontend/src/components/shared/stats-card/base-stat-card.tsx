'use client';

import type { ReactNode } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DURATIONS } from '@/lib/design';
import { cn } from '@/lib/utils';

export interface BaseStatCardTrend {
  value: number;
  isPositive: boolean;
  label?: string;
}

export interface BaseStatCardProps {
  label: string;
  value: ReactNode;
  icon?: React.ReactNode;
  accentClass?: string;
  trend?: BaseStatCardTrend;
  animate?: boolean;
  variant?: 'default' | 'card';
  isLoading?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  iconContainerClassName?: string;
  contentClassName?: string;
  disableHoverEffect?: boolean;
  animateValue?: boolean;
  pulseOnGrowth?: boolean;
  trendColors?: {
    positive?: string;
    negative?: string;
  };
}

function AnimatedValue({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1500, bounce: 0 });
  const displayValue = useTransform(spring, (latest) => Math.round(latest).toLocaleString());

  motionValue.set(value);

  return <motion.span>{displayValue}</motion.span>;
}

function DefaultSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 shadow-sm backdrop-blur-sm flex flex-col h-full">
      <div className="flex flex-col gap-2.5 sm:gap-3 flex-1 justify-between">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 sm:w-20 animate-pulse rounded bg-muted" />
          <div className="size-8 sm:size-10 shrink-0 animate-pulse rounded-xl bg-muted" />
        </div>
        <div>
          <div className="h-6 sm:h-8 w-12 sm:w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <Card className="rounded-xl flex flex-col h-full">
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
      <div className="flex flex-col gap-2.5 sm:gap-3 flex-1 justify-between">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 sm:w-24 animate-pulse rounded bg-muted" />
            <div className="flex size-8 sm:size-10 animate-pulse items-center justify-center rounded-xl bg-muted" />
          </div>
          <div>
            <div className="h-6 w-12 sm:w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DefaultCard({
  label,
  value,
  icon,
  accentClass,
  trend,
  className,
  labelClassName,
  valueClassName,
  iconContainerClassName,
  contentClassName,
  disableHoverEffect,
  animateValue,
  pulseOnGrowth,
  trendColors = {},
}: BaseStatCardProps) {
  const renderedValue = animateValue && typeof value === 'number' ? <AnimatedValue value={value} /> : value;

  const positiveClasses = trendColors.positive ?? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30';
  const negativeClasses = trendColors.negative ?? 'bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:ring-rose-500/30';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/60 bg-card p-3 sm:p-4 shadow-sm backdrop-blur-sm transition-all duration-300 flex flex-col h-full',
        !disableHoverEffect && 'hover:shadow-xl hover:-translate-y-1.5',
        accentClass,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent opacity-70" />
      <div className={cn('relative flex flex-col gap-2.5 sm:gap-3 flex-1 justify-between', contentClassName)}>
        <div className="flex items-center justify-between">
          <p className={cn('truncate text-xs sm:text-sm font-semibold text-muted-foreground', labelClassName)}>{label}</p>
          {icon ? (
            <div
              className={cn(
                'flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-xl shadow-xs ring-1 ring-border/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md',
                iconContainerClassName,
              )}
              style={{ backgroundColor: 'var(--kpi-bg, #F3F4F6)', color: 'var(--kpi-icon, #6B7280)' }}
            >
              {icon}
            </div>
          ) : null}
        </div>
        <div>
          <p className={cn('text-2xl sm:text-3xl font-extrabold leading-none tabular-nums tracking-tight text-foreground truncate', valueClassName)}>{renderedValue}</p>
        </div>
        {trend ? (
          <div className="flex items-center justify-between">
            <motion.div
              animate={pulseOnGrowth && trend.isPositive ? {
                scale: [1, 1.04, 1],
                transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              } : undefined}
            >
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ring-1 ring-inset shrink-0',
                  trend.isPositive ? positiveClasses : negativeClasses,
                )}
              >
                {trend.isPositive ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            </motion.div>
            {trend.label ? (
              <span className="text-xs text-muted-foreground/70">{trend.label}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BaseStatCard(props: BaseStatCardProps) {
  const { isLoading, variant, animate, className, value, animateValue, pulseOnGrowth, trendColors } = props;

  if (isLoading) {
    if (variant === 'card') {
      return <CardSkeleton />;
    }
    return <DefaultSkeleton />;
  }

  if (variant === 'card') {
    const renderedValue = animateValue && typeof value === 'number' ? <AnimatedValue value={value} /> : value;
    const positiveClasses = trendColors?.positive ?? 'text-emerald-600 dark:text-emerald-400';
    const negativeClasses = trendColors?.negative ?? 'text-destructive';

    return (
      <Card className={cn('group overflow-hidden rounded-xl flex flex-col h-full', className)}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent opacity-60" />
        <CardContent className="relative flex flex-col gap-2.5 sm:gap-3 p-3 sm:p-4 flex-1 justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate pe-2">{props.label}</span>
            {props.icon ? (
              <div
                className="flex size-8 sm:size-10 items-center justify-center rounded-xl shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:shadow-md shrink-0"
                style={{ backgroundColor: 'var(--kpi-bg, #F3F4F6)', color: 'var(--kpi-icon, #6B7280)' }}
              >
                {props.icon}
              </div>
            ) : null}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-semibold tabular-nums text-foreground truncate">{renderedValue}</span>
            </div>
          </div>
          {props.trend ? (
            <div className="flex items-center justify-between">
              <motion.span
                className={cn(
                  'text-xs font-medium',
                  props.trend.isPositive ? positiveClasses : negativeClasses,
                )}
                animate={pulseOnGrowth && props.trend.isPositive ? {
                  scale: [1, 1.08, 1],
                  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                } : undefined}
              >
                {props.trend.isPositive ? '+' : '-'}
                {Math.abs(props.trend.value)}%
              </motion.span>
              {props.trend.label ? (
                <span className="text-xs text-muted-foreground/70">{props.trend.label}</span>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (animate) {
    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: DURATIONS.normal },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        <DefaultCard {...props} />
      </motion.div>
    );
  }

  return <DefaultCard {...props} />;
}
