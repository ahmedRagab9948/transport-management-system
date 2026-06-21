'use client';

import { cn } from '@/lib/utils';
import { CARD } from './design-tokens';

export interface GlassCardProps {
  variant?: keyof typeof CARD;
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function GlassCard({ variant = 'surface', children, className, as: Tag = 'div' }: GlassCardProps) {
  return (
    <Tag className={cn(CARD.base, CARD[variant], className)}>
      {children}
    </Tag>
  );
}
