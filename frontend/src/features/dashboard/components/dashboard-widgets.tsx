'use client';

import { ChevronRight, Truck, Users, Gauge } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/shared';
import { useT } from '@/lib/i18n';
import { useDriverStatusDistribution, useVehicleUtilization } from '../hooks/use-dashboard';

function FleetOverview() {
  const { t } = useT();
  const util = useVehicleUtilization();
  const data = util.data;
  const total = data?.reduce((sum, d) => sum + d.count, 0) ?? 0;
  const active = data?.find((d) => d.status === 'ACTIVE' || d.status === 'IN_TRIP')?.count ?? 0;
  const maintenance = data?.find((d) => d.status === 'IN_MAINTENANCE' || d.status === 'MAINTENANCE')?.count ?? 0;
  const idle = total - active - maintenance;

  return (
    <GlassCard variant="surface" className="flex-1">
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="size-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">{t('dashboard.fleet_overview')}</h3>
        </div>
        {util.isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('dashboard.total_vehicles')}</span>
              <span className="font-semibold tabular-nums">{total}</span>
            </div>
            {total > 0 && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(active / total) * 100}%` }} />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('dashboard.active_on_trip')}</span>
              <span className="font-medium text-success tabular-nums">{active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('dashboard.idle')}</span>
              <span className="font-medium text-muted-foreground tabular-nums">{idle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('dashboard.under_maintenance')}</span>
              <span className="font-medium text-warning tabular-nums">{maintenance}</span>
            </div>
          </div>
        )}
        <Link href="/vehicles" className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          {t('dashboard.view_fleet')}
          <ChevronRight className="size-3" />
        </Link>
      </div>
    </GlassCard>
  );
}

function DriverOverview() {
  const { t } = useT();
  const driverStatus = useDriverStatusDistribution();
  const data = driverStatus.data;
  const total = data?.reduce((sum, d) => sum + d.count, 0) ?? 0;
  const onTrip = data?.find((d) => d.status === 'ACTIVE' || d.status === 'BUSY' || d.status === 'IN_TRIP')?.count ?? 0;
  const available = data?.find((d) => d.status === 'AVAILABLE')?.count ?? 0;
  const offDuty = data?.find((d) => d.status === 'INACTIVE' || d.status === 'OFF_DUTY')?.count ?? 0;

  return (
    <GlassCard variant="surface" className="flex-1">
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Users className="size-4 text-emerald-500" />
          </div>
          <h3 className="text-sm font-semibold">{t('dashboard.driver_overview')}</h3>
        </div>
        {driverStatus.isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('dashboard.total_drivers')}</span>
              <span className="font-semibold tabular-nums">{total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('dashboard.on_trip')}</span>
              <span className="font-medium text-primary tabular-nums">{onTrip}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('dashboard.available')}</span>
              <span className="font-medium text-success tabular-nums">{available}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('dashboard.off_duty')}</span>
              <span className="font-medium text-muted-foreground tabular-nums">{offDuty}</span>
            </div>
          </div>
        )}
        <Link href="/drivers" className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          {t('dashboard.view_drivers')}
          <ChevronRight className="size-3" />
        </Link>
      </div>
    </GlassCard>
  );
}

function VehicleUtilizationWidget() {
  const { t } = useT();
  const util = useVehicleUtilization();
  const data = util.data;
  const total = data?.reduce((sum, d) => sum + d.count, 0) ?? 0;
  const active = data?.find((d) => d.status === 'ACTIVE' || d.status === 'IN_TRIP')?.count ?? 0;
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <GlassCard variant="surface" className="flex-1">
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Gauge className="size-4 text-amber-500" />
          </div>
          <h3 className="text-sm font-semibold">{t('dashboard.vehicle_utilization')}</h3>
        </div>
        {util.isLoading ? (
          <div className="space-y-2">
            <div className="h-10 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-3xl font-bold tabular-nums text-foreground">{pct}%</span>
              <p className="text-xs text-muted-foreground">{t('dashboard.utilization_rate')}</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('dashboard.active_vehicles')}</span>
              <span className="font-semibold tabular-nums">{active}/{total}</span>
            </div>
          </div>
        )}
        <Link href="/reports" className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          {t('dashboard.view_reports')}
          <ChevronRight className="size-3" />
        </Link>
      </div>
    </GlassCard>
  );
}

export function DashboardWidgets() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <FleetOverview />
      <DriverOverview />
      <VehicleUtilizationWidget />
    </div>
  );
}
