'use client';

import { motion } from 'framer-motion';
import { staggerContainerFast, DURATIONS } from '@/lib/design';
import { cn } from '@/lib/utils';
import { BaseStatCard, type BaseStatCardProps } from './base-stat-card';

const columnsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
};

export interface StatsGridProps {
  items: BaseStatCardProps[];
  columns?: keyof typeof columnsMap;
  className?: string;
}

export function StatsGrid({ items, columns = 4, className }: StatsGridProps) {
  return (
    <motion.div
      variants={staggerContainerFast}
      initial="hidden"
      animate="visible"
      className={cn('grid gap-3 sm:gap-4', columnsMap[columns], className)}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label + (typeof item.value === 'string' ? item.value : String(item.value))}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: DURATIONS.normal, delay: i * DURATIONS.staggerSm },
            },
          }}
        >
          <BaseStatCard {...item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
