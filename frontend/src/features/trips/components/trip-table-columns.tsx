'use client';

import { memo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { StatusBadge } from '@/components/shared';
import { useT } from '@/lib/i18n';
import type { TripTableRow } from '../types/trip.types';
import { TripActions } from './trip-actions';

function getPlateNumber(trip: TripTableRow): string {
  const plates = trip.vehicle?.plates;
  if (plates && plates.length > 0) {
    const tractor = plates.find((p) => p.role === 'TRUCK_HEAD');
    if (tractor) return tractor.plateNumber;
    return plates[0].plateNumber;
  }
  return trip.vehicle?.vehicleCode ?? '-';
}

const TripActionsCell = memo(function TripActionsCell({ row }: { row: TripTableRow }) {
  return <TripActions trip={row} />;
});

export function useTripColumns(): ColumnDef<TripTableRow, unknown>[] {
  const { t, isRTL } = useT();
  const arrow = isRTL ? '←' : '→';
  const formatDate = (value: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return [
    {
      id: 'tripNumber',
      header: t('trips.trip_number'),
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.original.formattedTripNumber}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'company',
      header: t('clients.company_name'),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.original.clientDisplay}</span>
      ),
    },
    {
      id: 'contract',
      header: t('contracts.title'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.contractDisplay}</span>
      ),
    },
    {
      id: 'startDate',
      header: t('trips.start_date'),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-foreground">{formatDate(row.original.startDate)}</span>
      ),
    },
    {
      id: 'driver',
      header: t('trips.column_driver'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.driver?.fullName ?? <span className="text-muted-foreground">-</span>}</span>
      ),
    },
    {
      id: 'plate',
      header: t('trips.column_plate'),
      cell: ({ row }) => (
        <span className="text-sm font-mono text-foreground">{getPlateNumber(row.original)}</span>
      ),
    },
    {
      id: 'route',
      header: t('trips.column_route'),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-sm text-foreground">
          <span className="truncate max-w-28 sm:max-w-40">{row.original.fromLocation}</span>
          <span className="text-muted-foreground shrink-0">{arrow}</span>
          <span className="truncate max-w-28 sm:max-w-40">{row.original.toLocation}</span>
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge status={row.original.status} domain="trip" />
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => <TripActionsCell row={row.original} />,
      enableSorting: false,
    },
  ];
}
