'use client';

import { useT } from '@/lib/i18n';
import { ConfirmDialog } from './confirm-dialog';

interface DeleteEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  identifier?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function DeleteEntityDialog({
  open,
  onOpenChange,
  entityName,
  identifier,
  isLoading = false,
  onConfirm,
}: DeleteEntityDialogProps) {
  const { t } = useT();

  const description = identifier
    ? t('common.confirm_delete_entity_named', { entity: entityName, identifier })
    : t('common.confirm_delete_entity', { entity: entityName });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('common.delete_entity_title', { entity: entityName })}
      description={description}
      confirmLabel={t('common.yes_delete')}
      variant="danger"
      isLoading={isLoading}
      onConfirm={onConfirm}
    />
  );
}
