'use client';

import { useT } from '@/lib/i18n';

interface LocalizedCityProps {
  name: string;
  className?: string;
}

export function LocalizedCity({ name, className }: LocalizedCityProps) {
  const { t } = useT();
  if (!name) return null;
  const key = `cities.${name.toLowerCase().trim()}`;
  const translated = t(key);
  const display = translated !== key ? translated : name;
  return <span className={className}>{display}</span>;
}
