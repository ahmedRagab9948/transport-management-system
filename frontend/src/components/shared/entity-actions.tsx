'use client';

import { Edit, Eye, Trash2, ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useT } from '@/lib/i18n';
import type { PermissionKey } from '@/constants/permissions';
import { DeleteEntityDialog, StatusChangeDialog } from '@/components/shared';
import type { StatusTone } from '@/constants/statuses';

interface ActionConfig {
  label?: string;
  viewPermission?: PermissionKey;
  editPermission?: PermissionKey;
  deletePermission?: PermissionKey;
  statusPermission?: PermissionKey;
}

interface EntityActionsProps {
  id: string;
  editRoute?: string;
  viewRoute?: string;
  status?: string;
  domain?: 'trip' | 'vehicle' | 'driver' | 'client' | 'contract';
  statusOptions?: Array<{ value: string; label: string; tone: StatusTone }>;
  onDelete?: () => Promise<void>;
  onStatusChange?: (newStatus: string) => Promise<void>;
  permissions: ActionConfig;
  isDeleting?: boolean;
  isStatusChanging?: boolean;
}

export function EntityActions({
  id,
  editRoute,
  viewRoute,
  status,
  domain,
  statusOptions,
  onDelete,
  onStatusChange,
  permissions,
  isDeleting,
  isStatusChanging,
}: EntityActionsProps) {
  const router = useRouter();
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const canView = permissions.viewPermission ? hasPermission(permissions.viewPermission) : true;
  const canEdit = permissions.editPermission ? hasPermission(permissions.editPermission) : false;
  const canDelete = permissions.deletePermission ? hasPermission(permissions.deletePermission) : false;
  const canChangeStatus = permissions.statusPermission ? hasPermission(permissions.statusPermission) : false;

  function handleView() {
    if (viewRoute) router.push(viewRoute);
  }

  function handleEdit() {
    if (editRoute) router.push(editRoute);
  }

  async function handleDelete() {
    if (!onDelete) return;
    await onDelete();
    setDeleteOpen(false);
  }

  async function handleStatusChange(newStatus: string) {
    if (!onStatusChange) return;
    await onStatusChange(newStatus);
    setStatusOpen(false);
  }

  const hasAnyAction = canView || canEdit || canDelete || canChangeStatus;
  if (!hasAnyAction) return null;

  return (
    <>
      <div className="flex items-center justify-center gap-0.5">
        {canView ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView();
                  }}
                  aria-label={t('common.view')}
                >
                  <Eye className="size-4" />
                </Button>
              }
            />
            <TooltipContent>{t('common.view')}</TooltipContent>
          </Tooltip>
        ) : null}

        {canEdit ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  aria-label={t('common.edit')}
                >
                  <Edit className="size-4" />
                </Button>
              }
            />
            <TooltipContent>{t('common.edit')}</TooltipContent>
          </Tooltip>
        ) : null}

        {canChangeStatus && statusOptions && onStatusChange ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusOpen(true);
                  }}
                  aria-label={t('common.change_status')}
                >
                  <ArrowLeftRight className="size-4" />
                </Button>
              }
            />
            <TooltipContent>{t('common.change_status')}</TooltipContent>
          </Tooltip>
        ) : null}

        {canDelete ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteOpen(true);
                  }}
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="size-4 text-destructive/70" />
                </Button>
              }
            />
            <TooltipContent>{t('common.delete')}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {statusOptions && onStatusChange ? (
        <StatusChangeDialog
          open={statusOpen}
          onOpenChange={setStatusOpen}
          title={t('common.change_status')}
          description=""
          currentStatus={status ?? ''}
          statusOptions={statusOptions}
          domain={domain ?? 'trip'}
          isLoading={isStatusChanging ?? false}
          onConfirm={handleStatusChange}
        />
      ) : null}

      <DeleteEntityDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        entityName={t(`entities.${domain ?? 'entity'}`)}
        isLoading={isDeleting ?? false}
        onConfirm={handleDelete}
      />
    </>
  );
}
