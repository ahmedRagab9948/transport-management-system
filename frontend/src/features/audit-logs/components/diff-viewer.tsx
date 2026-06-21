'use client';

import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface DiffViewerProps {
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function getChangedKeys(
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null,
): string[] {
  const keys = new Set<string>();
  if (oldValues) Object.keys(oldValues).forEach((k) => keys.add(k));
  if (newValues) Object.keys(newValues).forEach((k) => keys.add(k));
  return Array.from(keys).sort();
}

export function DiffViewer({ oldValues, newValues }: DiffViewerProps) {
  const { t, isRTL } = useT();
  const [expanded, setExpanded] = useState(false);

  if (!oldValues && !newValues) return null;

  const changedKeys = getChangedKeys(oldValues, newValues);
  if (changedKeys.length === 0) return null;

  return (
    <div className="rounded-lg border bg-muted/20">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <Clock className="size-3" />
        <span>{t('audit_logs.view_changes', { count: changedKeys.length })}</span>
        {expanded ? <ChevronUp className="ms-auto size-3" /> : <ChevronDown className="ms-auto size-3" />}
      </button>
      {expanded && (
        <div className="divide-y border-t">
          {changedKeys.map((key) => {
            const oldVal = oldValues?.[key];
            const newVal = newValues?.[key];
            const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);

            return (
              <div key={key} className="grid grid-cols-3 gap-2 px-3 py-1.5 text-xs">
                <span className="font-medium text-muted-foreground">{key}</span>
                <span className={changed ? 'text-destructive line-through' : 'text-muted-foreground'}>
                  {formatValue(oldVal)}
                </span>
                <span className={changed ? 'text-emerald-600' : 'text-muted-foreground'}>
                  {formatValue(newVal ?? oldVal)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
