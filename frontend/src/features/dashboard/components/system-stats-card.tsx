'use client';

import { Users, FileText, HardDrive } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/shared';
import { CARD_BODY } from '@/components/shared/design-system/design-tokens';
import { useT } from '@/lib/i18n';
import { useDashboardSummary } from '../hooks/use-dashboard';

export function SystemStatsCard() {
  const { t } = useT();
  const summary = useDashboardSummary();
  const data = summary.data;

  if (summary.isLoading || !data) return null;

  const stats = [
    {
      label: t('entities.contract', { default: 'Contracts' }),
      value: data.activeContracts ?? 0,
      icon: FileText,
    },
    {
      label: t('entities.client', { default: 'Clients' }),
      value: data.activeClients ?? 0,
      icon: Users,
    },
    {
      label: t('dashboard.vehicle_utilization'),
      value: data.availableVehicles ?? 0,
      icon: HardDrive,
    },
  ];

  return (
    <GlassCard variant="surface">
      <SectionHeader title={t('dashboard.system_overview')} />
      <div className={CARD_BODY}>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                <s.icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                <p className="text-lg font-semibold text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
