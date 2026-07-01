'use client';

import { memo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { PERMISSIONS } from '@/constants/permissions';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, KeyRound, LogOut, UserX, UserCheck } from 'lucide-react';
import type { User } from '../types/user.types';
import { UserStatusBadge } from './user-status-badge';

interface UserActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onForceLogout: (user: User) => void;
  onToggleActive: (user: User) => void;
  onView: (user: User) => void;
}

const UserActions = memo(function UserActions({ user, onEdit, onResetPassword, onForceLogout, onToggleActive, onView }: UserActionsProps) {
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(PERMISSIONS.UPDATE_USER);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t('common.actions')}>
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuItem onClick={() => onView(user)}>
          <Eye className="size-4" />
          {t('common.view')}
        </DropdownMenuItem>
        {canEdit ? (
          <DropdownMenuItem onClick={() => onEdit(user)}>
            <Edit className="size-4" />
            {t('common.edit')}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        {canEdit ? (
          <DropdownMenuItem onClick={() => onResetPassword(user)}>
            <KeyRound className="size-4" />
            {t('users.reset_password')}
          </DropdownMenuItem>
        ) : null}
        {canEdit ? (
          <DropdownMenuItem onClick={() => onForceLogout(user)}>
            <LogOut className="size-4" />
            {t('users.force_logout')}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        {canEdit ? (
          user.isActive ? (
            <DropdownMenuItem onClick={() => onToggleActive(user)}>
              <UserX className="size-4" />
              {t('users.deactivate')}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onToggleActive(user)}>
              <UserCheck className="size-4" />
              {t('users.activate')}
            </DropdownMenuItem>
          )
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export interface UseUserColumnsOptions {
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onForceLogout: (user: User) => void;
  onToggleActive: (user: User) => void;
  onView: (user: User) => void;
}

export function useUserColumns(options: UseUserColumnsOptions): ColumnDef<User, unknown>[] {
  const { t } = useT();
  const { onEdit, onResetPassword, onForceLogout, onToggleActive, onView } = options;

  const formatDate = (value: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return [
    {
      accessorKey: 'fullName',
      header: t('users.full_name'),
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.original.fullName}</span>
      ),
    },
    {
      accessorKey: 'email',
      header: t('users.email'),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      id: 'phone',
      header: t('users.phone'),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.phone ?? '-'}</span>
      ),
    },
    {
      id: 'role',
      header: t('users.role'),
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">{row.original.role.name}</Badge>
      ),
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: ({ row }) => <UserStatusBadge isActive={row.original.isActive} />,
    },
    {
      id: 'lastLoginAt',
      header: t('users.last_login'),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">{formatDate(row.original.lastLoginAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <UserActions
          user={row.original}
          onEdit={onEdit}
          onResetPassword={onResetPassword}
          onForceLogout={onForceLogout}
          onToggleActive={onToggleActive}
          onView={onView}
        />
      ),
      enableSorting: false,
    },
  ];
}
