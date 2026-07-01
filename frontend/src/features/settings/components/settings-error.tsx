'use client';

import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

interface SettingsErrorProps {
  onRetry: () => void;
}

export function SettingsError({ onRetry }: SettingsErrorProps) {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <p className="text-destructive">{t('settings.load_error')}</p>
      <Button variant="outline" onClick={onRetry}>
        {t('common.retry')}
      </Button>
    </div>
  );
}
