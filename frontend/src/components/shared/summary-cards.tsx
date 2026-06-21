'use client';

import { cn } from '@/lib/utils';
import { BaseStatCard } from './stats-card/base-stat-card';
import { StatsGrid } from './stats-card/stats-grid';
import type { BaseStatCardTrend } from './stats-card/base-stat-card';

export interface SummaryCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  className?: string;
  trend?: BaseStatCardTrend;
}

interface SummaryCardsProps {
  cards: SummaryCard[];
  className?: string;
  isLoading?: boolean;
}

function getGridCols(count: number): string {
  if (count <= 1) return 'grid-cols-1';
  if (count <= 2) return 'grid-cols-2';
  if (count <= 3) return 'grid-cols-2 sm:grid-cols-3';
  if (count <= 4) return 'grid-cols-2 sm:grid-cols-4';
  if (count <= 5) return 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5';
  return 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4';
}

export function SummaryCards({ cards, className, isLoading }: SummaryCardsProps) {
  const colCount = Math.max(1, Math.min(cards.length || 4, 6));

  if (isLoading) {
    const skeletonCount = Math.max(cards.length || 4, 4);
    const gridCols = getGridCols(Math.min(skeletonCount, 6));
    return (
      <div className={cn(gridCols, 'gap-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <BaseStatCard key={i} label="" value="" isLoading variant="default" />
        ))}
      </div>
    );
  }

  return (
    <StatsGrid
      items={cards.map((card) => ({
        label: card.label,
        value: card.value,
        icon: card.icon,
        accentClass: card.className,
        trend: card.trend,
      }))}
      columns={colCount as 1 | 2 | 3 | 4 | 5 | 6}
      className={className}
    />
  );
}
