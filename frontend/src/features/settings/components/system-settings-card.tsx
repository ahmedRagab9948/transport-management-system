'use client';

import { memo } from 'react';
import { SettingsCard } from './settings-card';
import type { SettingsGroup } from '../types/settings.types';

const FIELDS = [
  { key: 'version', labelKey: 'settings.version', readOnly: true },
  { key: 'environment', labelKey: 'settings.environment', readOnly: true },
  { key: 'database', labelKey: 'settings.database', readOnly: true },
  { key: 'storage', labelKey: 'settings.storage', readOnly: true },
  { key: 'healthStatus', labelKey: 'settings.health_status', readOnly: true },
  { key: 'buildVersion', labelKey: 'settings.build_version', readOnly: true },
] as const;

interface SystemSettingsCardProps {
  data: SettingsGroup;
}

function SystemSettingsCardInner({ data }: SystemSettingsCardProps) {
  return <SettingsCard titleKey="settings.system" fields={FIELDS} data={data} />;
}

export const SystemSettingsCard = memo(SystemSettingsCardInner);
