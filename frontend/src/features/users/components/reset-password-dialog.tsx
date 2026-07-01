'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { useResetPassword } from '../hooks/use-users';
import type { User } from '../types/user.types';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function ResetPasswordDialog({ open, onOpenChange, user }: ResetPasswordDialogProps) {
  const { t } = useT();
  const { toast } = useToast();
  const mutation = useResetPassword();
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleReset() {
    mutation.mutate(user.id, {
      onSuccess: (data) => {
        setTemporaryPassword(data.temporaryPassword);
        toast({
          title: t('users.password_reset'),
          variant: 'success',
        });
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

  async function handleCopy() {
    if (temporaryPassword) {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose() {
    setTemporaryPassword(null);
    setCopied(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('users.reset_password_title')}</DialogTitle>
          <DialogDescription>
            {temporaryPassword
              ? t('users.reset_password_success_desc', { name: user.fullName })
              : t('users.reset_password_desc', { name: user.fullName })}
          </DialogDescription>
        </DialogHeader>

        {temporaryPassword ? (
          <Field>
            <FieldLabel>{t('users.temporary_password')}</FieldLabel>
            <div className="flex gap-2">
              <Input value={temporaryPassword} readOnly className="font-mono text-sm flex-1" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label={t('common.copy')}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('users.save_password_warning')}</p>
          </Field>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            {temporaryPassword ? t('common.close') : t('common.cancel')}
          </Button>
          {!temporaryPassword ? (
            <Button type="button" variant="primary" onClick={handleReset} loading={mutation.isPending}>
              {t('users.reset_password')}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
