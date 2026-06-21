'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

export interface FilterChip {
  key: string;
  label: string;
  value?: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function FilterChips({ chips, onRemove, onClearAll }: FilterChipsProps) {
  const { t } = useT();

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-0.5 text-xs text-foreground"
        >
          {chip.label}
          {chip.value ? <span className="text-muted-foreground">: {chip.value}</span> : null}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            className="ms-0.5 rounded-sm p-0.5 hover:bg-muted"
            aria-label={t('common.clear')}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-foreground"
        aria-label={t('common.clear')}
      >
        {t('common.clear')}
      </Button>
    </div>
  );
}
