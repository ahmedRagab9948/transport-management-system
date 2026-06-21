'use client';

import { cn } from '@/lib/utils';

export interface FilterCheckboxProps {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  checkboxLabel?: string;
  variant?: 'bar' | 'card';
}

export function FilterCheckbox({
  checked = false,
  onChange,
  label,
  checkboxLabel,
  variant = 'bar',
}: FilterCheckboxProps) {
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
      <label
        className={cn(
          'flex items-center gap-2 rounded-lg border border-input bg-background text-sm text-muted-foreground cursor-pointer hover:bg-muted transition-colors',
          isCard ? 'h-12 px-4' : 'h-8 px-2',
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 accent-primary"
        />
        {checkboxLabel}
      </label>
    </div>
  );
}
