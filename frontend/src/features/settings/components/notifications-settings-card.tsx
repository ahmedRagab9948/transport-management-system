'use client';

import { memo } from 'react';
import { SettingsCard } from './settings-card';
import type { SettingsGroup } from '../types/settings.types';

const FIELDS = [
  { key: 'emailNotifications', labelKey: 'settings.email_notifications' },
  { key: 'inAppNotifications', labelKey: 'settings.in_app_notifications' },
  { key: 'smsEnabled', labelKey: 'settings.sms_enabled' },
  { key: 'sessionTimeout', labelKey: 'settings.session_timeout' },
  { key: 'loginAlerts', labelKey: 'settings.login_alerts' },
  { key: 'passwordExpiration', labelKey: 'settings.password_expiration' },
] as const;

interface NotificationsSettingsCardProps {
  data: SettingsGroup;
}

function NotificationsSettingsCardInner({ data }: NotificationsSettingsCardProps) {
  return <SettingsCard titleKey="settings.notifications" fields={FIELDS} data={data} />;
}

export const NotificationsSettingsCard = memo(NotificationsSettingsCardInner);
