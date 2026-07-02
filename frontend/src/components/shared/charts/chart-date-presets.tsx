'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface Preset {
  label: string;
  getRange: () => { from: string; to: string };
}

interface ChartDatePresetsProps {
  value: { from: string; to: string };
  onChange: (from: string, to: string) => void;
  className?: string;
}

const presets: Preset[] = [
  {
    label: 'Today',
    getRange: () => {
      const today = new Date();
      return { from: toISODate(today), to: toISODate(today) };
    },
  },
  {
    label: 'This Week',
    getRange: () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      return { from: toISODate(start), to: toISODate(today) };
    },
  },
  {
    label: 'This Month',
    getRange: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toISODate(start), to: toISODate(today) };
    },
  },
  {
    label: 'This Quarter',
    getRange: () => {
      const today = new Date();
      const q = Math.floor(today.getMonth() / 3);
      const start = new Date(today.getFullYear(), q * 3, 1);
      return { from: toISODate(start), to: toISODate(today) };
    },
  },
  {
    label: 'This Year',
    getRange: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), 0, 1);
      return { from: toISODate(start), to: toISODate(today) };
    },
  },
];

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isSameDate(a: string, b: string): boolean {
  return a === b;
}

function matchesPreset(from: string, to: string, preset: Preset): boolean {
  const r = preset.getRange();
  return isSameDate(from, r.from) && isSameDate(to, r.to);
}

export const ChartDatePresets = memo(function ChartDatePresets({ value, onChange, className }: ChartDatePresetsProps) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)} role="group" aria-label="Date range presets">
      {presets.map((preset) => {
        const isActive = matchesPreset(value.from, value.to, preset);
        return (
          <button
            key={preset.label}
            onClick={() => {
              const r = preset.getRange();
              onChange(r.from, r.to);
            }}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            aria-pressed={isActive}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
});
