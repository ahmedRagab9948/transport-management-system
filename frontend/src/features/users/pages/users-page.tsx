'use client';

import { useState, useCallback } from 'react';
import { Users as UsersIcon, UserCheck, UserX } from 'lucide-react';
import { MAX_PAGE_SIZE } from '@tms/shared';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { AdvancedFilters, DataTableWrapper, ExportDropdown, PageHeader, PageSection, SummaryCards } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useEntityFilters } from '@/components/shared/hooks/use-entity-filters';
import { downloadCsv } from '@/lib/csv-export';
import { useUsers, useUsersRoles, useUsersSummary } from '../hooks/use-users';
import { usersService } from '../services/users.service';
import { useUserColumns } from '../components/users-table-columns';
import { CreateUserDialog } from '../components/create-user-dialog';
import { EditUserDialog } from '../components/edit-user-dialog';
import { DeleteUserDialog } from '../components/delete-user-dialog';
import { ActivateUserDialog } from '../components/activate-user-dialog';
import { ResetPasswordDialog } from '../components/reset-password-dialog';
import { ForceLogoutDialog } from '../components/force-logout-dialog';
import type { User } from '../types/user.types';

const DEFAULT_FILTERS = {
  search: undefined as string | undefined,
  roleId: undefined as string | undefined,
  isActive: undefined as boolean | undefined,
  page: undefined as string | undefined,
  limit: undefined as string | undefined,
};

const FILTER_CHIPS = [
  { key: 'search', labelKey: 'common.search' },
  { key: 'roleId', labelKey: 'users.role' },
  { key: 'isActive', labelKey: 'common.status' },
];

export function UsersPage() {
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(PERMISSIONS.CREATE_USER);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [forceLogoutOpen, setForceLogoutOpen] = useState(false);

  const {
    filters,
    setFilter,
    resetFilters,
    queryParams,
    filterChips,
    hasActiveFilters,
  } = useEntityFilters({
    defaults: DEFAULT_FILTERS,
    chips: FILTER_CHIPS as any,
    namespace: 'users',
  });

  const { data: roles = [] } = useUsersRoles();
  const usersQuery = useUsers(queryParams);
  const summaryQuery = useUsersSummary();

  const summaryCards = [
    { label: t('common.total'), value: summaryQuery.data?.total ?? 0, icon: <UsersIcon className="size-4" />, className: 'kpi-blue' },
    { label: t('users.active'), value: summaryQuery.data?.active ?? 0, icon: <UserCheck className="size-4" />, className: 'kpi-emerald' },
    { label: t('users.inactive'), value: summaryQuery.data?.inactive ?? 0, icon: <UserX className="size-4" />, className: 'kpi-rose' },
  ];

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setEditOpen(true);
  }, []);

  const handleResetPassword = useCallback((user: User) => {
    setSelectedUser(user);
    setResetPasswordOpen(true);
  }, []);

  const handleForceLogout = useCallback((user: User) => {
    setSelectedUser(user);
    setForceLogoutOpen(true);
  }, []);

  const handleToggleActive = useCallback((user: User) => {
    setSelectedUser(user);
    if (user.isActive) {
      setDeleteOpen(true);
    } else {
      setActivateOpen(true);
    }
  }, []);

  const handleView = useCallback((user: User) => {
    window.location.href = `/users/${user.id}`;
  }, []);

  const userColumns = useUserColumns({
    onEdit: handleEdit,
    onResetPassword: handleResetPassword,
    onForceLogout: handleForceLogout,
    onToggleActive: handleToggleActive,
    onView: handleView,
  });

  async function exportToCsv() {
    const response = await usersService.getUsers({ page: 1, limit: MAX_PAGE_SIZE });
    const headers = [t('users.full_name'), t('users.email'), t('users.phone'), t('users.role'), t('common.status'), t('users.last_login')];
    const rows = response.items.map((user) => [
      user.fullName,
      user.email,
      user.phone ?? '-',
      user.role.name,
      user.isActive ? t('users.active') : t('users.inactive'),
      user.lastLoginAt ?? '-',
    ]);
    downloadCsv(headers, rows, `users-export-${new Date().toISOString().split('T')[0]}.csv`);
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('users.title')}
        description={t('users.page_description')}
        actions={
          <div className="flex items-center gap-2">
            <ExportDropdown onExportCsv={exportToCsv} disabled={usersQuery.data?.items.length === 0} />
            {canCreate ? (
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                onClick={() => setCreateOpen(true)}
              >
                {t('users.create_user')}
              </button>
            ) : null}
          </div>
        }
      />

      <SummaryCards
        cards={summaryCards}
        isLoading={summaryQuery.isLoading}
      />

      <AdvancedFilters
        variant="card"
        showSearchButton
        fields={[
          { type: 'search', key: 'search', label: t('users.search'), placeholder: t('users.search_placeholder') },
          { type: 'select', key: 'roleId', label: t('users.role'), options: roles.map((r) => ({ value: r.id, label: r.name })), placeholder: t('filters.all_roles') },
          { type: 'select', key: 'isActive', label: t('common.status'), options: [
            { value: 'true', label: t('users.active') },
            { value: 'false', label: t('users.inactive') },
          ], placeholder: t('filters.all_statuses') },
        ]}
        values={filters as Record<string, string | boolean | undefined>}
        onChange={(key, value) => setFilter(key as keyof typeof DEFAULT_FILTERS, value)}
        onReset={resetFilters}
      />

      <DataTableWrapper
        query={usersQuery}
        columns={userColumns}
        hideExport
        filterChips={filterChips}
        onFilterChipRemove={(key) => setFilter(key as keyof typeof DEFAULT_FILTERS, undefined)}
        onFilterChipsClear={resetFilters}
        emptyTitle={hasActiveFilters ? t('users.no_users_filtered') : t('users.no_users')}
        emptyDescription={hasActiveFilters ? t('users.no_users_filtered_desc') : t('users.no_users_desc')}
        errorTitle={t('users.load_error')}
        onPageChange={(p) => setFilter('page', p)}
        onLimitChange={(l) => setFilter('limit', l)}
      />

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      {selectedUser ? (
        <>
          <EditUserDialog
            key={`edit-${selectedUser.id}`}
            open={editOpen}
            onOpenChange={setEditOpen}
            user={selectedUser}
          />
          <DeleteUserDialog
            key={`delete-${selectedUser.id}`}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            user={selectedUser}
          />
          <ActivateUserDialog
            key={`activate-${selectedUser.id}`}
            open={activateOpen}
            onOpenChange={setActivateOpen}
            user={selectedUser}
          />
          <ResetPasswordDialog
            key={`reset-${selectedUser.id}`}
            open={resetPasswordOpen}
            onOpenChange={setResetPasswordOpen}
            user={selectedUser}
          />
          <ForceLogoutDialog
            key={`force-${selectedUser.id}`}
            open={forceLogoutOpen}
            onOpenChange={setForceLogoutOpen}
            user={selectedUser}
          />
        </>
      ) : null}
    </PageSection>
  );
}
