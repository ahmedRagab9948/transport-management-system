'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { EntityActions, StatusBadge } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { VEHICLE_STATUS_TONES } from '@/constants/statuses';
import type { StatusTone } from '@/constants/statuses';
import { useT } from '@/lib/i18n';
import { useDeleteVehicle, useUpdateVehicleStatus } from '../hooks/use-vehicles';
import type { Vehicle } from '../types/vehicle.types';

interface VehicleActionsCellProps {
  row: Vehicle;
}

function VehicleActionsCell({ row }: VehicleActionsCellProps) {
  const { t } = useT();
  const deleteMutation = useDeleteVehicle();
  const statusMutation = useUpdateVehicleStatus();

  const STATUS_OPTIONS = Object.entries(VEHICLE_STATUS_TONES)
    .filter(([key]) => key !== 'AVAILABLE' && key !== 'BUSY' && key !== 'MAINTENANCE' && key !== 'IN_TRIP')
    .map(([value, tone]) => ({
      value,
      label: t(`common_statuses.${value.toLowerCase().replace(/\s+/g, '_')}`),
      tone: tone as StatusTone,
    }));

  return (
    <EntityActions
      id={row.id}
      viewRoute={ROUTES.vehiclesDetail(row.id)}
      editRoute={ROUTES.vehiclesEdit(row.id)}
      status={row.status}
      domain="vehicle"
      statusOptions={STATUS_OPTIONS}
      permissions={{
        viewPermission: PERMISSIONS.VIEW_VEHICLES,
        editPermission: PERMISSIONS.UPDATE_VEHICLE,
        deletePermission: PERMISSIONS.DELETE_VEHICLE,
        statusPermission: PERMISSIONS.CHANGE_VEHICLE_STATUS,
      }}
      onDelete={async () => {
        await deleteMutation.mutateAsync(row.id);
      }}
      onStatusChange={async (newStatus) => {
        await statusMutation.mutateAsync({ id: row.id, status: newStatus });
      }}
      isDeleting={deleteMutation.isPending}
      isStatusChanging={statusMutation.isPending}
    />
  );
}

export function useVehicleColumns(): ColumnDef<Vehicle, unknown>[] {
  const { t } = useT();
  const formatDate = (value: string) => {
    if (!value) return '-';
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return [
    {
      id: 'ref',
      header: '#',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.index + 1}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'vehicleCode',
      header: t('vehicles.column_code'),
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.original.vehicleCode}</span>
      ),
    },
    {
      id: 'plates',
      header: t('vehicles.column_plates'),
      cell: ({ row }) => (
        <div className="flex flex-col items-center gap-0.5">
          {row.original.plates.map((plate) => (
            <span key={plate.id} className="text-sm font-mono text-foreground">
              {plate.plateNumber}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: t('vehicles.column_type'),
      cell: ({ row }) => {
        const typeKey = `vehicles.type_${row.original.type.toLowerCase()}`;
        return <span className="text-sm text-foreground">{t(typeKey)}</span>;
      },
    },
    {
      id: 'make',
      header: t('vehicles.column_manufacturer'),
      cell: ({ row }) => {
        const parts = [row.original.manufacturer, row.original.model].filter(Boolean);
        return parts.length ? (
          <span className="text-sm text-foreground">{parts.join(' ')}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'capacityKg',
      header: t('vehicles.column_capacity'),
      cell: ({ row }) =>
        row.original.capacityKg ? (
          <span className="text-sm text-foreground">{row.original.capacityKg.toLocaleString()} kg</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge status={row.original.status} domain="vehicle" />
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => <VehicleActionsCell row={row.original} />,
    },
  ];
}
