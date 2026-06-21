'use client';

import { ArrowRight } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LocaleArrow({ className }: { className?: string }) {
  const { isRTL } = useT();
  return (
    <ArrowRight
      className={cn(
        'shrink-0 transition-transform',
        isRTL && 'rotate-180',
        className,
      )}
    />
  );
}
