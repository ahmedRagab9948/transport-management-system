'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { EntityActions, StatusBadge } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { CLIENT_STATUS } from '@tms/shared';
import { CLIENT_STATUS_TONES } from '@/constants/statuses';
import type { StatusTone } from '@/constants/statuses';
import { useT } from '@/lib/i18n';
import { useDeleteClient, useUpdateClientStatus } from '../hooks/use-clients';
import type { Client } from '../types/client.types';

interface ClientActionsCellProps {
  row: Client;
}

function ClientActionsCell({ row }: ClientActionsCellProps) {
  const { t } = useT();
  const deleteMutation = useDeleteClient();
  const statusMutation = useUpdateClientStatus();

  const STATUS_OPTIONS = Object.values(CLIENT_STATUS).map((value) => ({
    value,
    label: t(`common_statuses.${value.toLowerCase().replace(/\s+/g, '_')}`),
    tone: CLIENT_STATUS_TONES[value] as StatusTone,
  }));

  return (
    <EntityActions
      id={row.id}
      viewRoute={ROUTES.clientsDetail(row.id)}
      editRoute={ROUTES.clientsEdit(row.id)}
      status={row.status}
      domain="client"
      statusOptions={STATUS_OPTIONS}
      permissions={{
        viewPermission: PERMISSIONS.VIEW_CLIENTS,
        editPermission: PERMISSIONS.UPDATE_CLIENT,
        deletePermission: PERMISSIONS.DELETE_CLIENT,
        statusPermission: PERMISSIONS.UPDATE_CLIENT,
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

export function useClientColumns(): ColumnDef<Client, unknown>[] {
  const { t } = useT();
  const formatDate = (value: string | null) => {
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
      accessorKey: 'companyName',
      header: t('clients.column_company'),
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.original.companyName}</span>
      ),
    },
    {
      accessorKey: 'contactPerson',
      header: t('clients.column_contact'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.contactPerson}</span>,
    },
    {
      accessorKey: 'email',
      header: t('clients.column_email'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.email}</span>,
    },
    {
      accessorKey: 'phone',
      header: t('clients.column_phone'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.phone}</span>,
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge status={row.original.status} domain="client" />
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: t('common.created_at'),
      cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => <ClientActionsCell row={row.original} />,
    },
  ];
}
