'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Profile } from '../types/profile.types';

interface ProfilePermissionsCardProps {
  profile?: Profile;
  isLoading: boolean;
}

const MODULE_LABELS: Record<string, string> = {
  DASHBOARD: 'nav.dashboard',
  USERS: 'nav.users',
  TRIPS: 'nav.trips',
  VEHICLES: 'nav.vehicles',
  DRIVERS: 'nav.drivers',
  CLIENTS: 'nav.clients',
  CONTRACTS: 'nav.contracts',
  SECTORS: 'nav.sectors',
  REPORTS: 'nav.reports',
  DISPATCH_BOARD: 'nav.dispatch_board',
  AUDIT_LOGS: 'nav.audit_logs',
  NOTIFICATIONS: 'nav.notifications',
};

export function ProfilePermissionsCard({ profile, isLoading }: ProfilePermissionsCardProps) {
  const { t } = useT();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const sortedModules = Object.entries(profile.permissions).sort(([a], [b]) =>
    (MODULE_LABELS[a] ?? a).localeCompare(MODULE_LABELS[b] ?? b),
  );

  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight">{t('profile.permissions')}</h2>
      </div>
      <div className="p-6">
        {sortedModules.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('profile.no_permissions')}</p>
        ) : (
          <div className="space-y-4">
            {sortedModules.map(([module, perms]) => {
              const label = MODULE_LABELS[module] ? t(MODULE_LABELS[module]) : module;
              return (
                <div key={module}>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {perms.map((perm) => (
                      <Badge
                        key={perm}
                        variant="secondary"
                        className={cn(
                          'text-xs font-normal',
                          'bg-primary/5 text-primary hover:bg-primary/10',
                        )}
                      >
                        {t(`permissions.${perm}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
