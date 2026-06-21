'use client';

import { AlertTriangle, Car, Clock, UserX, Wrench, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlassCard, SectionHeader } from '@/components/shared';
import { CARD_BODY } from '@/components/shared/design-system/design-tokens';
import { useT } from '@/lib/i18n';
import type { SystemAlerts as SystemAlertsType } from '../types/dashboard.types';

interface SystemAlertsProps {
  data: SystemAlertsType | undefined;
  isLoading: boolean;
}

export function SystemAlerts({ data, isLoading }: SystemAlertsProps) {
  const { t, locale } = useT();
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };
  const hasAlerts =
    data &&
    (data.expiringContracts.length > 0 ||
      data.vehiclesInMaintenance.length > 0 ||
      data.suspendedDrivers.length > 0 ||
      data.inactiveDrivers.length > 0);

  return (
    <GlassCard variant="surface">
      <SectionHeader title={t('dashboard.system_alerts')} icon={AlertTriangle} iconClassName="text-amber-500" />
      <div className={CARD_BODY}>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        ) : !hasAlerts ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            {t('dashboard.no_active_alerts')}
          </div>
        ) : (
          <div className="space-y-4">
            {data!.expiringContracts.length > 0 ? (
              <div className="rounded-lg border border-amber-200/50 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-950/10">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <Clock className="size-4" />
                  {t('dashboard.contracts_expiring')}
                </h4>
                <div className="space-y-2">
                  {data!.expiringContracts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg bg-card px-4 py-2.5 text-sm shadow-sm"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{c.contractNumber}</span>
                        <span className="ms-2 text-muted-foreground">— {c.client.companyName}</span>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        {formatDate(c.endDate)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {data!.vehiclesInMaintenance.length > 0 ? (
              <div className="rounded-lg border border-orange-200/50 bg-orange-50/50 p-4 dark:border-orange-800/30 dark:bg-orange-950/10">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-orange-700 dark:text-orange-400">
                  <Wrench className="size-4" />
                  {t('dashboard.vehicles_in_maintenance')}
                </h4>
                <div className="space-y-2">
                  {data!.vehiclesInMaintenance.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 rounded-lg bg-card px-4 py-2.5 text-sm shadow-sm"
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <Car className="size-4 text-orange-500" />
                      </div>
                      <span className="font-semibold text-foreground">{v.vehicleCode}</span>
                      {v.notes ? (
                        <span className="text-muted-foreground">— {v.notes}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {data!.suspendedDrivers.length > 0 ? (
              <div className="rounded-lg border border-red-200/50 bg-red-50/50 p-4 dark:border-red-800/30 dark:bg-red-950/10">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
                  <UserX className="size-4" />
                  {t('dashboard.suspended_drivers')}
                </h4>
                <div className="space-y-2">
                  {data!.suspendedDrivers.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-lg bg-card px-4 py-2.5 text-sm shadow-sm"
                    >
                      <span className="font-semibold text-foreground">{d.fullName}</span>
                      <Badge variant="destructive" className="shrink-0 text-xs">
                        {t('common_statuses.suspended')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {data!.inactiveDrivers.length > 0 ? (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <UserX className="size-4" />
                  {t('dashboard.inactive_drivers')}
                </h4>
                <div className="space-y-2">
                  {data!.inactiveDrivers.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-lg bg-card px-4 py-2.5 text-sm shadow-sm"
                    >
                      <span className="font-medium text-foreground">{d.fullName}</span>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {t('common_statuses.inactive')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
