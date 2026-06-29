'use client';

import { Suspense } from 'react';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { ResetPasswordForm } from '@/features/auth/forms/reset-password-form';
import { useT } from '@/lib/i18n';

export default function ResetPasswordPage() {
  const { t } = useT();
  return (
    <AuthShell
      titleKey="auth.reset_password_title"
      descriptionKey="auth.reset_password_description"
    >
      <Suspense fallback={<div className="text-sm text-muted-foreground">{t('common.loading')}</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
