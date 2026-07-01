'use client';

import { Globe, Mail, MapPin, Phone, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/lib/i18n';
import type { Profile } from '../types/profile.types';

interface ProfileInformationCardProps {
  profile?: Profile;
  isLoading: boolean;
}

export function ProfileInformationCard({ profile, isLoading }: ProfileInformationCardProps) {
  const { t, isRTL } = useT();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-36" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const fields = [
    { label: t('profile.full_name'), value: profile.fullName, icon: User },
    { label: t('profile.username'), value: profile.username, icon: User },
    { label: t('profile.email'), value: profile.email, icon: Mail },
    { label: t('profile.phone'), value: profile.phone ?? '-', icon: Phone },
    {
      label: t('profile.language'),
      value: profile.preferredLanguage === 'ar' ? t('profile.arabic') : t('profile.english'),
      icon: Globe,
    },
    { label: t('profile.timezone'), value: profile.timezone ?? '-', icon: MapPin },
  ];

  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight">{t('profile.personal_information')}</h2>
      </div>
      <div className="p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.label} className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <field.icon className="size-3" />
                {field.label}
              </dt>
              <dd className="text-sm font-medium">{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
