'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { useUpdateUser, useUsersRoles } from '../hooks/use-users';
import { updateUserSchema, type UpdateUserFormValues } from '../schemas/user.schema';
import type { User } from '../types/user.types';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { t } = useT();
  const { toast } = useToast();
  const mutation = useUpdateUser(user.id);
  const { data: roles = [], isLoading: rolesLoading } = useUsersRoles();

  const schema = updateUserSchema(t);
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      roleId: '',
      isActive: undefined,
      otpEnabled: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? '',
        roleId: user.role.id,
        isActive: user.isActive,
        otpEnabled: user.otpEnabled,
      });
    }
  }, [open, user, form]);

  const errors = form.formState.errors;

  const handleSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        roleId: values.roleId,
        isActive: values.isActive,
        otpEnabled: values.otpEnabled,
      },
      {
        onSuccess: () => {
          toast({
            title: t('users.user_updated'),
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
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('users.edit_user')}</DialogTitle>
          <DialogDescription>{t('users.edit_user_desc', { name: user.fullName })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="edit-fullName" required>{t('users.full_name')}</FieldLabel>
              <Input
                id="edit-fullName"
                placeholder={t('users.full_name_placeholder')}
                disabled={mutation.isPending}
                aria-invalid={!!errors.fullName}
                {...form.register('fullName')}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="edit-email" required>{t('users.email')}</FieldLabel>
              <Input
                id="edit-email"
                type="email"
                placeholder={t('users.email_placeholder')}
                disabled={mutation.isPending}
                aria-invalid={!!errors.email}
                {...form.register('email')}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="edit-phone">{t('users.phone')}</FieldLabel>
              <Input
                id="edit-phone"
                placeholder={t('users.phone_placeholder')}
                disabled={mutation.isPending}
                aria-invalid={!!errors.phone}
                {...form.register('phone')}
              />
              <FieldError errors={[errors.phone]} />
            </Field>

            <Field data-invalid={!!errors.roleId}>
              <FieldLabel required>{t('users.role')}</FieldLabel>
              <Controller
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <Combobox
                    options={roles.map((r) => ({ value: r.id, label: r.name }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('users.select_role')}
                    searchPlaceholder={t('common.search') + '...'}
                    emptyText={t('common.no_results')}
                    disabled={mutation.isPending || rolesLoading}
                    loading={rolesLoading}
                    error={!!errors.roleId}
                  />
                )}
              />
              <FieldError errors={[errors.roleId]} />
            </Field>

            <Field>
              <FieldLabel>{t('users.is_active')}</FieldLabel>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  className="size-4 rounded border-border"
                  disabled={mutation.isPending}
                  {...form.register('isActive')}
                />
                <label htmlFor="edit-isActive" className="text-sm text-muted-foreground">
                  {t('users.active_status')}
                </label>
              </div>
            </Field>

            <Field>
              <FieldLabel>{t('users.otp_enabled')}</FieldLabel>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-otpEnabled"
                  className="size-4 rounded border-border"
                  disabled={mutation.isPending}
                  {...form.register('otpEnabled')}
                />
                <label htmlFor="edit-otpEnabled" className="text-sm text-muted-foreground">
                  {t('users.otp_status')}
                </label>
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
