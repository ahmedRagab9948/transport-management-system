'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  variant?: 'bar' | 'card';
}

export function FilterSelect({
  value = '',
  onChange,
  options,
  placeholder,
  label,
  disabled = false,
  variant = 'bar',
}: FilterSelectProps) {
  const isCard = variant === 'card';

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
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value || '')}
          disabled={disabled}
          className={cn(
            'w-full appearance-none border border-input bg-background text-sm text-foreground outline-none transition-all duration-200 hover:bg-muted focus-visible:ring-2 dark:bg-card',
            isCard
              ? 'h-12 rounded-xl px-4 pe-10 transition-all duration-200 focus-visible:ring-primary/30'
              : 'h-8 rounded-lg px-2 pe-7 focus-visible:ring-ring/30',
            disabled && 'cursor-not-allowed opacity-50',
          )}
          aria-label={placeholder || label}
        >
          {placeholder ? (
            <option value="">{placeholder}</option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground transition-transform duration-200 ease-out group-focus-within:rotate-180',
          isCard ? 'end-3 size-5' : 'end-2 size-4',
        )} />
      </div>
    </div>
  );
}
