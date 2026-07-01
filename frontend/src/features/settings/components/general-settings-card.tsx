'use client';

import { memo } from 'react';
import { SettingsCard } from './settings-card';
import type { SettingsGroup } from '../types/settings.types';

const FIELDS = [
  { key: 'applicationName', labelKey: 'settings.application_name' },
  { key: 'companyName', labelKey: 'settings.company_name' },
  { key: 'companyEmail', labelKey: 'settings.company_email' },
  { key: 'companyPhone', labelKey: 'settings.company_phone' },
  { key: 'companyAddress', labelKey: 'settings.company_address' },
  { key: 'companyLogo', labelKey: 'settings.company_logo' },
  { key: 'timezone', labelKey: 'settings.timezone' },
  { key: 'dateFormat', labelKey: 'settings.date_format' },
  { key: 'timeFormat', labelKey: 'settings.time_format' },
  { key: 'language', labelKey: 'settings.language' },
  { key: 'rtlPreview', labelKey: 'settings.rtl_preview' },
] as const;

interface GeneralSettingsCardProps {
  data: SettingsGroup;
}

function GeneralSettingsCardInner({ data }: GeneralSettingsCardProps) {
  return <SettingsCard titleKey="settings.general" fields={FIELDS} data={data} />;
}

export const GeneralSettingsCard = memo(GeneralSettingsCardInner);
