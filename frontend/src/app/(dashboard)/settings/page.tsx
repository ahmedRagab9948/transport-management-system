'use client';

import { useT } from '@/lib/i18n';
import { ModulePlaceholder } from '@/features/layout/components/module-placeholder';

export default function SettingsPage() {
  const { t } = useT();
  return (
    <ModulePlaceholder
      title={t('nav.settings')}
      description={t('settings.description')}
    />
  );
}
