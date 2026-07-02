'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { useChangePassword } from '../hooks/use-profile';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function createSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z
    .object({
      oldPassword: z.string().min(1, t('validation.required')),
      newPassword: z.string().min(8, t('validation.password_min')),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwords_mismatch'),
      path: ['confirmPassword'],
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: t('profile.same_password'),
      path: ['newPassword'],
    });
}

type FormValues = z.infer<ReturnType<typeof createSchema>>;

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { t } = useT();
  const mutation = useChangePassword();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const schema = createSchema(t);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  function handleSubmit(values: FormValues) {
    mutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('profile.change_password')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Field data-invalid={!!form.formState.errors.oldPassword}>
            <FieldLabel htmlFor="old-password">{t('profile.current_password')}</FieldLabel>
            <div className="relative">
              <Input
                id="old-password"
                type={showOld ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={!!form.formState.errors.oldPassword}
                {...form.register('oldPassword')}
              />
              <button
                type="button"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowOld(!showOld)}
                aria-label={showOld ? t('common.hide_password') : t('common.show_password')}
              >
                {showOld ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <FieldError errors={[form.formState.errors.oldPassword]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.newPassword}>
            <FieldLabel htmlFor="new-password">{t('profile.new_password')}</FieldLabel>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={!!form.formState.errors.newPassword}
                {...form.register('newPassword')}
              />
              <button
                type="button"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? t('common.hide_password') : t('common.show_password')}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <FieldError errors={[form.formState.errors.newPassword]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.confirmPassword}>
            <FieldLabel htmlFor="confirm-password">{t('profile.confirm_password')}</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.confirmPassword}
              {...form.register('confirmPassword')}
            />
            <FieldError errors={[form.formState.errors.confirmPassword]} />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('profile.change_password')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
