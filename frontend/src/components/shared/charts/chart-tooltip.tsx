'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const ChartTooltip = memo(function ChartTooltip({ active, payload, label, valueFormatter, className }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const formatValue = valueFormatter ?? ((v: number) => v.toLocaleString());

  return (
    <div
      className={cn(
        'rounded-lg border border-border/50 bg-popover px-3 py-2 text-xs shadow-md backdrop-blur-md',
        className,
      )}
    >
      {label ? (
        <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      ) : null}
      <div className="flex flex-col gap-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: entry.color || 'var(--color-chart-1)' }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ms-auto font-medium tabular-nums text-foreground">
              {typeof entry.value === 'number' ? formatValue(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
