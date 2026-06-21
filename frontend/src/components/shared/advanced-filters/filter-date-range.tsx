'use client';

import { cn } from '@/lib/utils';

export interface FilterDateRangeProps {
  fromValue?: string;
  toValue?: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  label?: string;
  fromLabel?: string;
  toLabel?: string;
  variant?: 'bar' | 'card';
}

export function FilterDateRange({
  fromValue = '',
  toValue = '',
  onFromChange,
  onToChange,
  label,
  fromLabel,
  toLabel,
  variant = 'bar',
}: FilterDateRangeProps) {
  const isCard = variant === 'card';

  const inputClass = cn(
    'w-full border border-input bg-background text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2',
    isCard
      ? 'h-12 rounded-xl px-4 transition-all duration-200 focus-visible:ring-primary/30'
      : 'h-8 rounded-lg px-2 focus-visible:ring-ring/30',
  );

  return (
    <div className={isCard ? 'space-y-2' : 'space-y-1'}>
      {label ? (
        <span className={cn(
          'block font-medium text-muted-foreground',
          isCard ? 'text-sm' : 'text-xs',
        )}>
          {label}
        </span>
      ) : null}
      <div className="flex flex-col gap-2">
        <div>
          {fromLabel ? (
            <span className={cn(
              'block mb-1 font-medium text-muted-foreground',
              isCard ? 'text-sm' : 'text-xs',
            )}>
              {fromLabel}
            </span>
          ) : null}
          <input
            type="date"
            value={fromValue}
            onChange={(e) => onFromChange(e.target.value)}
            className={inputClass}
            aria-label={fromLabel}
          />
        </div>
        <div>
          {toLabel ? (
            <span className={cn(
              'block mb-1 font-medium text-muted-foreground',
              isCard ? 'text-sm' : 'text-xs',
            )}>
              {toLabel}
            </span>
          ) : null}
          <input
            type="date"
            value={toValue}
            onChange={(e) => onToChange(e.target.value)}
            className={inputClass}
            aria-label={toLabel}
          />
        </div>
      </div>
    </div>
  );
}
