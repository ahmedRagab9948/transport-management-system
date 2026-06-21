'use client';

import { cn } from '@/lib/utils';
import { SECTION } from './design-tokens';

export interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'wrapper' | 'grid' | 'grid2';
}

export function PageSection({ children, className, variant = 'grid2' }: PageSectionProps) {
  return (
    <div className={cn(SECTION[variant], className)}>
      {children}
    </div>
  );
}
