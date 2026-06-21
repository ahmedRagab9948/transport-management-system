/* eslint-disable react-hooks/static-components */
'use client';

import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useTripVehicles, useTripDrivers, useTripClients } from '../hooks/use-trips';
import type { TripStatus } from '../types/trip.types';

interface TripFiltersProps {
  search?: string;
  status?: TripStatus;
  clientId?: string;
  driverId?: string;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
  onSearchChange: (value?: string) => void;
  onStatusChange: (value?: TripStatus) => void;
  onClientIdChange: (value?: string) => void;
  onDriverIdChange: (value?: string) => void;
  onVehicleIdChange: (value?: string) => void;
  onDateFromChange: (value?: string) => void;
  onDateToChange: (value?: string) => void;
  onReset: () => void;
  className?: string;
}

export function TripFilters({
  search,
  status,
  clientId,
  driverId,
  vehicleId,
  dateFrom,
  dateTo,
  onSearchChange,
  onStatusChange,
  onClientIdChange,
  onDriverIdChange,
  onVehicleIdChange,
  onDateFromChange,
  onDateToChange,
  onReset,
  className,
}: TripFiltersProps) {
  const { t } = useT();
  const { data: vehicles = [] } = useTripVehicles();
  const { data: drivers = [] } = useTripDrivers();
  const { data: clients = [] } = useTripClients();

  const statuses: Array<{ value: TripStatus; label: string }> = [
    { value: 'PENDING', label: t('common_statuses.pending') },
    { value: 'ASSIGNED', label: t('common_statuses.assigned') },
    { value: 'IN_PROGRESS', label: t('common_statuses.in_progress') },
    { value: 'COMPLETED', label: t('common_statuses.completed') },
    { value: 'CANCELLED', label: t('common_statuses.cancelled') },
  ];

  function Select({
    label,
    value,
    onChange,
    options,
    ariaLabel,
    className,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: Array<{ value: string; label: string }>;
    ariaLabel: string;
    className?: string;
  }) {
    return (
      <div className={cn('space-y-2', className)}>
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label={ariaLabel}
        >
          <option value="">{ariaLabel}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div
      className={cn(
        `
      grid
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-5
      gap-5
      rounded-2xl
      border
      border-border/50
      bg-card/80
      backdrop-blur-md
      shadow-lg
      p-6
    `,
        className,
      )}
    >
      <div className="">
        <span>{t('trips.search')}</span>
        <div className="relative w-full flex items-center">
          <Search className="absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground rounded" />
          <Input
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value || undefined)}
            placeholder={t('trips.search_placeholder')}
            className="ps-12 h-12 rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      <Select
        label={t('clients.title')}
        value={clientId ?? ''}
        onChange={(v) => onClientIdChange(v || undefined)}
        options={clients.map((c) => ({ value: c.id, label: c.companyName }))}
        ariaLabel={t('filters.all_clients')}
        className="w-full"
      />

      <Select
        label={t('drivers.title')}
        value={driverId ?? ''}
        onChange={(v) => onDriverIdChange(v || undefined)}
        options={drivers.map((d) => ({ value: d.id, label: d.fullName }))}
        ariaLabel={t('filters.all_drivers')}
        className="w-full"
      />

      <Select
        label={t('vehicles.title')}
        value={vehicleId ?? ''}
        onChange={(v) => onVehicleIdChange(v || undefined)}
        options={vehicles.map((v) => ({ value: v.id, label: v.vehicleCode }))}
        ariaLabel={t('filters.all_vehicles')}
        className="w-full"
      />

      <Select
        label={t('common.status')}
        value={status ?? ''}
        onChange={(v) => onStatusChange((v || undefined) as TripStatus | undefined)}
        options={statuses.map((s) => ({ value: s.value, label: s.label }))}
        ariaLabel={t('filters.all_statuses')}
        className="w-full"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">{t('trips.start_date')}</label>
        <input
          type="date"
          value={dateFrom ?? ''}
          onChange={(e) => onDateFromChange(e.target.value || undefined)}
          className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label={t('trips.start_date')}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">{t('trips.end_date')}</label>
        <input
          type="date"
          value={dateTo ?? ''}
          onChange={(e) => onDateToChange(e.target.value || undefined)}
          className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label={t('trips.end_date')}
        />
      </div>

      <div className="flex items-end">
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl px-4"
          onClick={onReset}
          aria-label={t('common.clear')}
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
