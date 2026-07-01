'use client';

import { memo } from 'react';
import { SettingsCard } from './settings-card';
import type { SettingsGroup } from '../types/settings.types';

const FIELDS = [
  { key: 'defaultLanguage', labelKey: 'settings.default_language' },
  { key: 'supportedLanguages', labelKey: 'settings.supported_languages' },
  { key: 'defaultCurrency', labelKey: 'settings.default_currency' },
  { key: 'country', labelKey: 'settings.country' },
  { key: 'numberFormat', labelKey: 'settings.number_format' },
] as const;

interface LocalizationSettingsCardProps {
  data: SettingsGroup;
}

function LocalizationSettingsCardInner({ data }: LocalizationSettingsCardProps) {
  return <SettingsCard titleKey="settings.localization" fields={FIELDS} data={data} />;
}

export const LocalizationSettingsCard = memo(LocalizationSettingsCardInner);
