'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { useT } from '@/lib/i18n';
import { useAuth } from '../hooks/use-auth';
import { createLoginSchema, type LoginFormValues } from '../schemas/login.schema';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { t } = useT();
  const [showPassword, setShowPassword] = useState(false);

  const schema = createLoginSchema(t);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (result) => {
      if (result.requiresOtp) {
        router.push(ROUTES.verifyOtp);
        return;
      }
      const redirect = searchParams.get('redirect') ?? ROUTES.dashboard;
      router.replace(redirect);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  const errorMessage = mutation.error
    ? getApiErrorMessage(mutation.error, t('auth.sign_in_error'))
    : null;

  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <FieldGroup className="gap-5">
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email" className="text-sm font-semibold tracking-tight text-foreground/80">{t('common.email')}</FieldLabel>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/60 transition-colors" aria-hidden />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.email_placeholder')}
              aria-invalid={!!form.formState.errors.email}
              className="h-12 ps-12 pe-4 rounded-xl border-border/80 bg-muted/10 text-sm transition-all duration-200 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
              {...form.register('email')}
            />
          </div>
          <FieldError errors={[form.formState.errors.email]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password" className="text-sm font-semibold tracking-tight text-foreground/80">{t('common.password')}</FieldLabel>
            <Link
              href={ROUTES.forgotPassword}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {t('auth.forgot_password')}
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/60 transition-colors" aria-hidden />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('auth.password_placeholder')}
              aria-invalid={!!form.formState.errors.password}
              className="h-12 ps-12 pe-12 rounded-xl border-border/80 bg-muted/10 text-sm transition-all duration-200 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground cursor-pointer"
              aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          <FieldError errors={[form.formState.errors.password]} />
        </Field>
      </FieldGroup>

      {errorMessage ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 py-3 rounded-xl">
            <AlertDescription className="text-sm font-medium">{errorMessage}</AlertDescription>
          </Alert>
        </motion.div>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full shadow-md hover:shadow-lg transition-shadow"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <><Loader2 className="size-5 animate-spin me-2" /> {t('auth.signing_in')}</>
        ) : (
          t('auth.sign_in')
        )}
      </Button>
    </motion.form>
  );
}
