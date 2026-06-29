'use client';

import { Suspense } from 'react';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { OtpForm } from '@/features/auth/forms/otp-form';
import { useT } from '@/lib/i18n';

export default function VerifyOtpPage() {
  const { t } = useT();
  return (
    <AuthShell
      titleKey="auth.verify_identity"
      descriptionKey="auth.verify_identity_description"
    >
      <Suspense fallback={<div className="text-sm text-muted-foreground">{t('common.loading')}</div>}>
        <OtpForm />
      </Suspense>
    </AuthShell>
  );
}
