'use client';

import { Suspense } from 'react';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { useT } from '@/lib/i18n';

export default function ForgotPasswordPage() {
  const { t } = useT();
  return (
    <AuthShell
      titleKey="auth.forgot_password_title"
      descriptionKey="auth.forgot_password_description"
    >
      <Suspense fallback={<div className="text-sm text-muted-foreground">{t('common.loading')}</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
