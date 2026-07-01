'use client';

import { useT } from '@/lib/i18n';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { useDeleteUser } from '../hooks/use-users';
import type { User } from '../types/user.types';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function DeleteUserDialog({ open, onOpenChange, user }: DeleteUserDialogProps) {
  const { t } = useT();
  const { toast } = useToast();
  const mutation = useDeleteUser();

  function handleConfirm() {
    mutation.mutate(user.id, {
      onSuccess: () => {
        toast({
          title: t('users.user_deactivated'),
          variant: 'success',
        });
        onOpenChange(false);
      },
      onError: (error) => {
        toast({
          title: t('common.operation_failed'),
          description: getApiErrorMessage(error, t('common.retry')),
          variant: 'error',
        });
      },
    });
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('users.deactivate_user_title', { name: user.fullName })}
      description={t('users.deactivate_user_desc', { name: user.fullName })}
      confirmLabel={t('users.deactivate')}
      variant="danger"
      isLoading={mutation.isPending}
      onConfirm={handleConfirm}
    />
  );
}
