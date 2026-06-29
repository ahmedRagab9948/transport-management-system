'use client';

import { Suspense } from 'react';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/forms/login-form';
import { useT } from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useT();
  return (
    <AuthShell
      titleKey="auth.sign_in_title"
      descriptionKey="auth.sign_in_description"
    >
      <Suspense fallback={<div className="text-sm text-muted-foreground">{t('common.loading')}</div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
