'use client';

import { useCallback, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { FilterSearch } from './filter-search';
import { FilterSelect } from './filter-select';
import { FilterCheckbox } from './filter-checkbox';
import { FilterDateRange } from './filter-date-range';

type FilterOption = { value: string; label: string };

export type FilterField =
  | { type: 'search'; key: string; label?: string; placeholder?: string }
  | { type: 'select'; key: string; label?: string; options: FilterOption[]; placeholder?: string; disabled?: boolean }
  | { type: 'checkbox'; key: string; label?: string; checkboxLabel?: string }
  | { type: 'date-range'; key: string; label?: string; dateFromKey?: string; dateToKey?: string; fromLabel?: string; toLabel?: string };

export interface AdvancedFiltersProps {
  fields: FilterField[];
  values: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: unknown) => void;
  onReset: () => void;
  variant?: 'bar' | 'card';
  className?: string;
  showSearchButton?: boolean;
}

function getBarWrapperClass(type: string): string {
  switch (type) {
    case 'search':
      return 'relative min-w-[200px] flex-1 basis-[180px]';
    case 'select':
    case 'date-range':
      return 'min-w-[140px] flex-1 basis-[130px]';
    default:
      return '';
  }
}

export function AdvancedFilters({
  fields,
  values,
  onChange,
  onReset,
  variant = 'bar',
  className,
  showSearchButton = false,
}: AdvancedFiltersProps) {
  const { t } = useT();
  const isCard = variant === 'card';

  const [drafts, setDrafts] = useState<Record<string, any>>({});

  const getValue = useCallback(
    (key: string) => {
      if (showSearchButton && key in drafts) return drafts[key];
      return values[key];
    },
    [showSearchButton, drafts, values],
  );

  const handleFieldChange = useCallback(
    (key: string, rawValue: unknown) => {
      if (showSearchButton) {
        setDrafts((prev) => ({ ...prev, [key]: rawValue }));
        return;
      }
      const value = rawValue === '' || rawValue === false ? undefined : rawValue;
      onChange(key, value);
    },
    [onChange, showSearchButton],
  );

  const flushFilters = useCallback(() => {
    for (const key of Object.keys(drafts)) {
      const rawValue = drafts[key];
      const value = rawValue === '' || rawValue === false ? undefined : rawValue;
      onChange(key, value);
    }
  }, [drafts, onChange]);

  const handleSearchButton = useCallback(() => {
    flushFilters();
  }, [flushFilters]);

  const handleReset = useCallback(() => {
    setDrafts({});
    onReset();
  }, [onReset]);

  const renderField = (field: FilterField) => {
    switch (field.type) {
      case 'search':
        return (
          <FilterSearch
            key={field.key}
            value={String(getValue(field.key) ?? '')}
            onChange={(v) => handleFieldChange(field.key, v)}
            onSearch={showSearchButton ? handleSearchButton : undefined}
            placeholder={field.placeholder}
            label={field.label}
            variant={variant}
          />
        );
      case 'select':
        return (
          <FilterSelect
            key={field.key}
            value={getValue(field.key) as string | undefined}
            onChange={(v) => handleFieldChange(field.key, v)}
            options={field.options}
            placeholder={field.placeholder}
            label={field.label}
            disabled={field.disabled}
            variant={variant}
          />
        );
      case 'checkbox':
        return (
          <FilterCheckbox
            key={field.key}
            checked={getValue(field.key) as boolean | undefined}
            onChange={(v) => handleFieldChange(field.key, v)}
            label={field.label}
            checkboxLabel={field.checkboxLabel}
            variant={variant}
          />
        );
      case 'date-range': {
        const fromKey = field.dateFromKey || `${field.key}From`;
        const toKey = field.dateToKey || `${field.key}To`;
        return (
          <FilterDateRange
            key={field.key}
            fromValue={getValue(fromKey) as string | undefined}
            toValue={getValue(toKey) as string | undefined}
            onFromChange={(v) => handleFieldChange(fromKey, v)}
            onToChange={(v) => handleFieldChange(toKey, v)}
            label={field.label}
            fromLabel={field.fromLabel}
            toLabel={field.toLabel}
            variant={variant}
          />
        );
      }
    }
  };

  if (isCard) {
    const gridItems: React.ReactNode[] = [];

    for (const field of fields) {
      if (field.type === 'date-range') {
        const fromKey = field.dateFromKey || `${field.key}From`;
        const toKey = field.dateToKey || `${field.key}To`;

        gridItems.push(
          <div key={fromKey} className="space-y-2">
            {field.fromLabel ? (
              <span className="block text-sm font-medium text-muted-foreground">{field.fromLabel}</span>
            ) : null}
            <input
              type="date"
              value={String(getValue(fromKey) ?? '')}
              onChange={(e) => handleFieldChange(fromKey, e.target.value)}
              className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label={field.fromLabel}
            />
          </div>,
        );
        gridItems.push(
          <div key={toKey} className="space-y-2">
            {field.toLabel ? (
              <span className="block text-sm font-medium text-muted-foreground">{field.toLabel}</span>
            ) : null}
            <input
              type="date"
              value={String(getValue(toKey) ?? '')}
              onChange={(e) => handleFieldChange(toKey, e.target.value)}
              className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label={field.toLabel}
            />
          </div>,
        );
      } else {
        gridItems.push(renderField(field));
      }
    }

    if (showSearchButton) {
      gridItems.push(
        <div key="__search_btn__" className="space-y-2">
          <span className="block text-sm font-medium text-transparent select-none">_</span>
          <Button type="button" variant="primary" className="h-12 w-full rounded-xl" onClick={handleSearchButton}>
            <Search className="size-4 me-2" />
            {t('common.search')}
          </Button>
        </div>,
      );
    }

    gridItems.push(
      <div key="__reset_btn__" className="space-y-2">
        <span className="block text-sm font-medium text-transparent select-none">_</span>
        <Button type="button" variant="secondary" className="h-12 w-full rounded-xl" onClick={handleReset} aria-label={t('common.reset')}>
          <RotateCcw className="size-4 me-2" />
          {t('common.reset')}
        </Button>
      </div>,
    );

    return (
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md shadow-sm p-6',
          className,
        )}
      >
        {gridItems}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3',
        className,
      )}
    >
      {fields.map((field) => (
        <div key={field.key} className={getBarWrapperClass(field.type)}>
          {renderField(field)}
        </div>
      ))}
      {showSearchButton ? (
        <div className="flex items-end pb-0.5">
          <Button type="button" variant="primary" size="sm" onClick={handleSearchButton}>
            <Search className="size-3.5 me-1" />
            {t('common.search')}
          </Button>
        </div>
      ) : null}
      <div className="flex items-end pb-0.5">
        <Button type="button" variant="ghost" size="sm" onClick={handleReset} aria-label={t('common.reset')}>
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
