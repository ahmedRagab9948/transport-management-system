'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { EntityActions, StatusBadge } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { CONTRACT_STATUS } from '@tms/shared';
import { CONTRACT_STATUS_TONES } from '@/constants/statuses';
import type { StatusTone } from '@/constants/statuses';
import { useT } from '@/lib/i18n';
import { useDeleteContract, useUpdateContractStatus } from '../hooks/use-contracts';
import type { Contract } from '../types/contract.types';

interface ContractActionsCellProps {
  row: Contract;
}

function ContractActionsCell({ row }: ContractActionsCellProps) {
  const { t } = useT();
  const deleteMutation = useDeleteContract();
  const statusMutation = useUpdateContractStatus();

  const STATUS_OPTIONS = Object.values(CONTRACT_STATUS).map((value) => ({
    value,
    label: t(`common_statuses.${value.toLowerCase().replace(/\s+/g, '_')}`),
    tone: CONTRACT_STATUS_TONES[value] as StatusTone,
  }));

  return (
    <EntityActions
      id={row.id}
      viewRoute={ROUTES.contractsDetail(row.id)}
      editRoute={ROUTES.contractsEdit(row.id)}
      status={row.status}
      domain="contract"
      statusOptions={STATUS_OPTIONS}
      permissions={{
        viewPermission: PERMISSIONS.VIEW_CONTRACTS,
        editPermission: PERMISSIONS.UPDATE_CONTRACT,
        deletePermission: PERMISSIONS.DELETE_CONTRACT,
        statusPermission: PERMISSIONS.UPDATE_CONTRACT,
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

export function useContractColumns(): ColumnDef<Contract, unknown>[] {
  const { t, locale } = useT();
  const formatDate = (value: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const formatPrice = (value: string | null, currency: string) => {
    if (!value) return '-';
    return `${currency} ${Number(value).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      accessorKey: 'contractNumber',
      header: t('contracts.column_number'),
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.original.contractNumber}</span>
      ),
    },
    {
      accessorKey: 'title',
      header: t('contracts.column_title'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.title}</span>,
    },
    {
      id: 'client',
      header: t('contracts.column_client'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.client?.companyName ?? '-'}</span>
      ),
    },
    {
      accessorKey: 'fromLocation',
      header: t('contracts.column_from'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.fromLocation}</span>,
    },
    {
      accessorKey: 'toLocation',
      header: t('contracts.column_to'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.toLocation}</span>,
    },
    {
      id: 'price',
      header: t('contracts.column_price'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{formatPrice(row.original.price, row.original.currency)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge status={row.original.status} domain="contract" />
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
      cell: ({ row }) => <ContractActionsCell row={row.original} />,
    },
  ];
}
