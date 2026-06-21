'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { EntityActions, StatusBadge } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { DRIVER_STATUS_TONES } from '@/constants/statuses';
import type { StatusTone } from '@/constants/statuses';
import { useT } from '@/lib/i18n';
import { useDeleteDriver, useUpdateDriverStatus } from '../hooks/use-drivers';
import type { Driver } from '../types/driver.types';

interface DriverActionsCellProps {
  row: Driver;
}

function DriverActionsCell({ row }: DriverActionsCellProps) {
  const { t } = useT();
  const deleteMutation = useDeleteDriver();
  const statusMutation = useUpdateDriverStatus();

  const STATUS_OPTIONS = Object.entries(DRIVER_STATUS_TONES)
    .filter(([key]) => key !== 'IN_TRIP')
    .map(([value, tone]) => ({
    value,
    label: t(`common_statuses.${value.toLowerCase().replace(/\s+/g, '_')}`),
    tone: tone as StatusTone,
  }));

  return (
    <EntityActions
      id={row.id}
      viewRoute={ROUTES.driversDetail(row.id)}
      editRoute={ROUTES.driversEdit(row.id)}
      status={row.status}
      domain="driver"
      statusOptions={STATUS_OPTIONS}
      permissions={{
        viewPermission: PERMISSIONS.VIEW_DRIVERS,
        editPermission: PERMISSIONS.UPDATE_DRIVER,
        deletePermission: PERMISSIONS.DELETE_DRIVER,
        statusPermission: PERMISSIONS.CHANGE_DRIVER_STATUS,
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

export function useDriverColumns(): ColumnDef<Driver, unknown>[] {
  const { t } = useT();
  const formatDate = (value: string) => {
    if (!value) return '-';
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return [
    {
      id: 'serial',
      header: '#',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.index + 1}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'ref',
      header: t('drivers.driver_code'),
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.original.driverCode}</span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: t('drivers.column_name'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.fullName}</span>,
    },
    {
      accessorKey: 'phone',
      header: t('drivers.column_phone'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.phone}</span>,
    },
    {
      accessorKey: 'nationalId',
      header: t('drivers.column_national_id'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.nationalId}</span>,
    },
    {
      accessorKey: 'licenseNumber',
      header: t('drivers.column_license'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.licenseNumber}</span>,
    },
    {
      accessorKey: 'licenseExpiry',
      header: t('drivers.column_license_expiry'),
      cell: ({ row }) => <span className="text-sm tabular-nums">{formatDate(row.original.licenseExpiry)}</span>,
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge status={row.original.status} domain="driver" />
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => <DriverActionsCell row={row.original} />,
    },
  ];
}
