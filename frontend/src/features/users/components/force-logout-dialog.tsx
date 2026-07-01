'use client';

import { useT } from '@/lib/i18n';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { useForceLogout } from '../hooks/use-users';
import type { User } from '../types/user.types';

interface ForceLogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function ForceLogoutDialog({ open, onOpenChange, user }: ForceLogoutDialogProps) {
  const { t } = useT();
  const { toast } = useToast();
  const mutation = useForceLogout();

  function handleConfirm() {
    mutation.mutate(user.id, {
      onSuccess: () => {
        toast({
          title: t('users.force_logout_success'),
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
      title={t('users.force_logout_title', { name: user.fullName })}
      description={t('users.force_logout_desc', { name: user.fullName })}
      confirmLabel={t('users.force_logout')}
      variant="danger"
      isLoading={mutation.isPending}
      onConfirm={handleConfirm}
    />
  );
}
