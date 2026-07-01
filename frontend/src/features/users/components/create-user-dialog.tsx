'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
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
import { useCreateUser, useUsersRoles } from '../hooks/use-users';
import { createUserSchema, type CreateUserFormValues } from '../schemas/user.schema';

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { t } = useT();
  const { toast } = useToast();
  const mutation = useCreateUser();
  const { data: roles = [], isLoading: rolesLoading } = useUsersRoles();

  const schema = createUserSchema(t);
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      roleId: '',
      isActive: true,
      otpEnabled: true,
    },
  });

  const errors = form.formState.errors;

  function handleGeneratePassword() {
    const pwd = generatePassword();
    form.setValue('password', pwd);
  }

  const handleSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        roleId: values.roleId,
        isActive: values.isActive,
        otpEnabled: values.otpEnabled,
      },
      {
        onSuccess: () => {
          toast({
            title: t('users.user_created'),
            variant: 'success',
          });
          form.reset();
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
          <DialogTitle>{t('users.create_user')}</DialogTitle>
          <DialogDescription>{t('users.create_user_desc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName" required>{t('users.full_name')}</FieldLabel>
              <Input
                id="fullName"
                placeholder={t('users.full_name_placeholder')}
                disabled={mutation.isPending}
                aria-invalid={!!errors.fullName}
                {...form.register('fullName')}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email" required>{t('users.email')}</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder={t('users.email_placeholder')}
                disabled={mutation.isPending}
                aria-invalid={!!errors.email}
                {...form.register('email')}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password" required>{t('users.password')}</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  placeholder={t('users.password_placeholder')}
                  disabled={mutation.isPending}
                  aria-invalid={!!errors.password}
                  className="flex-1"
                  {...form.register('password')}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePassword}
                  disabled={mutation.isPending}
                >
                  {t('users.generate')}
                </Button>
              </div>
              <FieldError errors={[errors.password]} />
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">{t('users.phone')}</FieldLabel>
              <Input
                id="phone"
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
                  id="isActive"
                  className="size-4 rounded border-border"
                  disabled={mutation.isPending}
                  {...form.register('isActive')}
                />
                <label htmlFor="isActive" className="text-sm text-muted-foreground">
                  {t('users.active_status')}
                </label>
              </div>
            </Field>

            <Field>
              <FieldLabel>{t('users.otp_enabled')}</FieldLabel>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="otpEnabled"
                  className="size-4 rounded border-border"
                  disabled={mutation.isPending}
                  {...form.register('otpEnabled')}
                />
                <label htmlFor="otpEnabled" className="text-sm text-muted-foreground">
                  {t('users.otp_status')}
                </label>
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { form.reset(); onOpenChange(false); }}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('users.create_user')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
