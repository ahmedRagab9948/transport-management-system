'use client';

import { cn } from '@/lib/utils';
import { CARD_HEADER } from './design-tokens';

export interface SectionHeaderProps {
  title: string;
  icon?: React.ElementType;
  iconClassName?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, icon: Icon, iconClassName, action, className }: SectionHeaderProps) {
  return (
    <div className={cn(CARD_HEADER, className)}>
      {Icon ? <Icon className={cn('size-4', iconClassName ?? 'text-primary')} /> : null}
      <h3 className="text-sm font-semibold">{title}</h3>
      {action ? <div className="ms-auto">{action}</div> : null}
    </div>
  );
}
