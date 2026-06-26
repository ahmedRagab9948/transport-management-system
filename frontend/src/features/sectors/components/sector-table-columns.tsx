'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { EntityActions, StatusBadge } from '@/components/shared';
import { SECTOR_STATUS_TONES } from '@/constants/statuses';
import type { StatusTone } from '@/constants/statuses';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { useUpdateSectorStatus } from '../hooks/use-sectors';
import type { Sector } from '../types/sector.types';

interface SectorActionsCellProps {
  row: Sector;
}

function SectorActionsCell({ row }: SectorActionsCellProps) {
  const { t } = useT();
  const statusMutation = useUpdateSectorStatus();

  const STATUS_OPTIONS = Object.entries(SECTOR_STATUS_TONES)
    .filter(([key]) => key !== row.status)
    .map(([value, tone]) => ({
      value,
      label: t(`common_statuses.${value.toLowerCase()}`),
      tone: tone as StatusTone,
    }));

  return (
    <EntityActions
      id={row.id}
      viewRoute={ROUTES.sectorsDetail(row.id)}
      editRoute={ROUTES.sectorsEdit(row.id)}
      status={row.status}
      domain="client"
      statusOptions={STATUS_OPTIONS}
      permissions={{
        viewPermission: PERMISSIONS.VIEW_SECTORS,
        editPermission: PERMISSIONS.UPDATE_SECTOR,
        statusPermission: PERMISSIONS.CHANGE_SECTOR_STATUS,
      }}
      onStatusChange={async (newStatus) => {
        await statusMutation.mutateAsync({ id: row.id, status: newStatus });
      }}
      isStatusChanging={statusMutation.isPending}
    />
  );
}

export function useSectorColumns(): ColumnDef<Sector, unknown>[] {
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
      accessorKey: 'name',
      header: t('sectors.column_name'),
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'code',
      header: t('sectors.column_code'),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.code}</span>
      ),
    },
    {
      id: 'subSectorsCount',
      header: t('sectors.column_sub_sectors'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original._count.subSectors}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('sectors.column_status'),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge status={row.original.status} tone={SECTOR_STATUS_TONES[row.original.status] ?? 'neutral'} />
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: t('sectors.column_created'),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => <SectorActionsCell row={row.original} />,
    },
  ];
}
