'use client';

import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

interface UserStatusBadgeProps {
  isActive: boolean;
}

export function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
  const { t } = useT();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium border',
        isActive
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
          : 'bg-muted text-muted-foreground border-border',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          isActive ? 'bg-emerald-500' : 'bg-muted-foreground',
        )}
      />
      {isActive ? t('users.active') : t('users.inactive')}
    </span>
  );
}
