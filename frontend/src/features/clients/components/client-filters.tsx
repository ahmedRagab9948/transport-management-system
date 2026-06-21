'use client';

import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ClientStatus } from '../types/client.types';

interface ClientFiltersProps {
  search?: string;
  status?: ClientStatus;
  onSearchChange: (value?: string) => void;
  onStatusChange: (value?: ClientStatus) => void;
  onReset: () => void;
  className?: string;
}

export function ClientFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReset,
  className,
}: ClientFiltersProps) {
  const { t } = useT();

  const statuses: Array<{ value: ClientStatus; label: string }> = [
    { value: 'ACTIVE', label: t('filters.active') },
    { value: 'INACTIVE', label: t('filters.inactive') },
  ];

  return (
    <div className={cn('flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3', className)}>
      <div className="relative min-w-[200px] flex-1 basis-[180px]">
        <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search ?? ''}
          onChange={(e) => onSearchChange(e.target.value || undefined)}
          placeholder={t('clients.search_placeholder')}
          className="ps-8 h-8"
        />
      </div>

      <div className="space-y-1 min-w-[140px] flex-1 basis-[130px]">
        <label className="text-xs font-medium text-muted-foreground">{t('filters.all_statuses')}</label>
        <select
          value={status ?? ''}
          onChange={(event) =>
            onStatusChange((event.target.value || undefined) as ClientStatus | undefined)
          }
          className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30"
          aria-label={t('filters.all_statuses')}
        >
          <option value="">{t('filters.all_statuses')}</option>
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end pb-0.5">
        <Button type="button" variant="ghost" size="sm" onClick={onReset} aria-label={t('common.clear')}>
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
