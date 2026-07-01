'use client';

import { useT } from '@/lib/i18n';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { useActivateUser } from '../hooks/use-users';
import type { User } from '../types/user.types';

interface ActivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function ActivateUserDialog({ open, onOpenChange, user }: ActivateUserDialogProps) {
  const { t } = useT();
  const { toast } = useToast();
  const mutation = useActivateUser();

  function handleConfirm() {
    mutation.mutate(user.id, {
      onSuccess: () => {
        toast({
          title: t('users.user_activated'),
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
      title={t('users.activate_user_title', { name: user.fullName })}
      description={t('users.activate_user_desc', { name: user.fullName })}
      confirmLabel={t('users.activate')}
      variant="primary"
      isLoading={mutation.isPending}
      onConfirm={handleConfirm}
    />
  );
}
