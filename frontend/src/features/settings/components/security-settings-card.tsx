'use client';

import { memo } from 'react';
import { SettingsCard } from './settings-card';
import type { SettingsGroup } from '../types/settings.types';

const FIELDS = [
  { key: 'passwordMinLength', labelKey: 'settings.password_min_length' },
  { key: 'passwordRequireUppercase', labelKey: 'settings.password_require_uppercase' },
  { key: 'passwordRequireNumbers', labelKey: 'settings.password_require_numbers' },
  { key: 'passwordRequireSymbols', labelKey: 'settings.password_require_symbols' },
  { key: 'maxLoginAttempts', labelKey: 'settings.max_login_attempts' },
  { key: 'lockoutDuration', labelKey: 'settings.lockout_duration' },
  { key: 'mfaEnabled', labelKey: 'settings.mfa_enabled' },
] as const;

interface SecuritySettingsCardProps {
  data: SettingsGroup;
}

function SecuritySettingsCardInner({ data }: SecuritySettingsCardProps) {
  return <SettingsCard titleKey="settings.security" fields={FIELDS} data={data} />;
}

export const SecuritySettingsCard = memo(SecuritySettingsCardInner);
