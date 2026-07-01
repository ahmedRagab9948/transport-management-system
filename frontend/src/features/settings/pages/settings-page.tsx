'use client';

import { PageSection, PageHeader } from '@/components/shared';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { useT } from '@/lib/i18n';
import { useSettings } from '../hooks/use-settings';
import { GeneralSettingsCard } from '../components/general-settings-card';
import { LocalizationSettingsCard } from '../components/localization-settings-card';
import { NotificationsSettingsCard } from '../components/notifications-settings-card';
import { SecuritySettingsCard } from '../components/security-settings-card';
import { SystemSettingsCard } from '../components/system-settings-card';
import { SettingsLoading } from '../components/settings-loading';
import { SettingsError } from '../components/settings-error';

export function SettingsPage() {
  const { t } = useT();
  const { data, isLoading, isError, refetch } = useSettings();

  if (isLoading) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('nav.settings')} description={t('settings.description')} />
        <SettingsLoading />
      </PageSection>
    );
  }

  if (isError || !data) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <PageHeader title={t('nav.settings')} description={t('settings.description')} />
        <SettingsError onRetry={() => refetch()} />
      </PageSection>
    );
  }

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader title={t('nav.settings')} description={t('settings.description')} />
      <div className="space-y-6">
        <GeneralSettingsCard data={data.General} />
        <LocalizationSettingsCard data={data.Localization} />
        <NotificationsSettingsCard data={data.Notifications} />
        <SecuritySettingsCard data={data.Security} />
        <SystemSettingsCard data={data.System} />
      </div>
    </PageSection>
  );
}
