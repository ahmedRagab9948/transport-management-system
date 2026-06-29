'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { useToast } from '@/components/ui/toast';
import { createForgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/forgot-password.schema';

export function ForgotPasswordForm() {
  const router = useRouter();
  const { t } = useT();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const schema = createForgotPasswordSchema(t);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ForgotPasswordFormValues) => {
      // Mock API call - delay 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: t('auth.password_reset_sent'),
        description: t('auth.password_reset_sent_description'),
        variant: 'success',
      });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6 py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10"
        >
          <CheckCircle2 className="size-8 text-emerald-500" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">{t('auth.check_your_email')}</h2>
          <p className="text-sm text-muted-foreground">{t('auth.password_reset_email_sent')}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.login)}
          className="w-full"
        >
          <ArrowLeft className="size-4 me-2" />
          {t('auth.back_to_login')}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <FieldGroup className="gap-6">
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email" className="text-sm font-semibold tracking-tight text-foreground/80">{t('common.email')}</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/60 transition-colors" aria-hidden />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.email_placeholder')}
              aria-invalid={!!form.formState.errors.email}
              className="h-11 ps-11 pe-4 rounded-lg border-border/80 bg-muted/10 transition-all duration-200 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
              {...form.register('email')}
            />
          </div>
          <FieldError errors={[form.formState.errors.email]} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <><Loader2 className="size-5 animate-spin me-2" /> {t('auth.sending')}</>
        ) : (
          t('auth.send_reset_link')
        )}
      </Button>

      <div className="text-center">
        <Link
          href={ROUTES.login}
          className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none"
        >
          <ArrowLeft className="size-4 me-2" />
          {t('auth.back_to_login')}
        </Link>
      </div>
    </motion.form>
  );
}
