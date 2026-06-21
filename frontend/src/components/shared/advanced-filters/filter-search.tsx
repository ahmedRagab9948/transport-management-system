'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface FilterSearchProps {
  value?: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  label?: string;
  variant?: 'bar' | 'card';
}

export function FilterSearch({
  value = '',
  onChange,
  onSearch,
  placeholder,
  label,
  variant = 'bar',
}: FilterSearchProps) {
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
      <div className="relative flex items-center">
        <Search className={cn(
          'absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground',
          isCard ? 'size-5' : 'size-4',
        )} />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch?.();
            }
          }}
          placeholder={placeholder}
          className={cn(
            isCard
              ? 'ps-12 h-12 rounded-xl text-sm hover:bg-muted dark:bg-background'
              : 'ps-8 h-8',
          )}
        />
      </div>
    </div>
  );
}
