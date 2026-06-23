'use client';

import { useT } from '@/lib/i18n';
import { StatsGrid } from '@/components/shared/stats-card/stats-grid';
import type { DispatchBoardStats } from '../types/dispatch-board.types';

interface Props {
  stats: DispatchBoardStats;
  isLoading?: boolean;
}

export function DispatchBoardStats({ stats, isLoading }: Props) {
  const { t } = useT();

  const items = [
    {
      label: t('dispatch_board.stats.total'),
      value: stats.draft + stats.pending + stats.assigned + stats.driver_confirmed + stats.loading + stats.on_route + stats.waiting + stats.unloading,
      accentClass: 'border-s-4 border-s-primary',
      isLoading,
    },
    {
      label: t('dispatch_board.stats.waiting'),
      value: stats.waiting ?? 0,
      accentClass: 'border-s-4 border-s-amber-400',
      isLoading,
    },
    {
      label: t('dispatch_board.stats.waiting_over_30'),
      value: stats.waitingOver30min ?? 0,
      accentClass: 'border-s-4 border-s-orange-400',
      isLoading,
    },
    {
      label: t('dispatch_board.stats.waiting_over_60'),
      value: stats.waitingOver60min ?? 0,
      accentClass: 'border-s-4 border-s-rose-400',
      isLoading,
    },
    {
      label: t('dispatch_board.stats.available_vehicles'),
      value: stats.availableVehicles ?? 0,
      accentClass: 'border-s-4 border-s-emerald-400',
      isLoading,
    },
    {
      label: t('dispatch_board.stats.available_drivers'),
      value: stats.availableDrivers ?? 0,
      accentClass: 'border-s-4 border-s-emerald-400',
      isLoading,
    },
  ];

  return <StatsGrid items={items} columns={6} />;
}
