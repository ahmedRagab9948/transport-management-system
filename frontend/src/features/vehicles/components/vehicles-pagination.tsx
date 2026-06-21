'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

interface VehiclesPaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function VehiclesPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: VehiclesPaginationProps) {
  const { t } = useT();
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>
        {t('pagination.showing_results', { from: first, to: last, total })}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none"
          aria-label={t('pagination.items_per_page')}
        >
          {[10, 20, 50].map((value) => (
            <option key={value} value={value}>
              {value} / {t('common.page')}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('common.previous')}
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </Button>
        <span className="min-w-20 text-center">
          {t('pagination.page_info', { current: page, total: Math.max(totalPages, 1) })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('common.next')}
        >
          <ChevronRight className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
