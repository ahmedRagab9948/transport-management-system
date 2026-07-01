'use client';

import { CalendarClock, KeyRound, LogIn, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/lib/i18n';
import type { Profile } from '../types/profile.types';

interface ProfileActivityCardProps {
  profile?: Profile;
  isLoading: boolean;
}

export function ProfileActivityCard({ profile, isLoading }: ProfileActivityCardProps) {
  const { t, isRTL } = useT();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(
      profile.preferredLanguage === 'ar' ? 'ar-EG' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  const activities = [
    {
      icon: LogIn,
      label: t('profile.last_login'),
      date: formatDate(profile.lastLoginAt),
    },
    {
      icon: Pencil,
      label: t('profile.last_profile_update'),
      date: formatDate(profile.profileUpdatedAt),
    },
    {
      icon: KeyRound,
      label: t('profile.last_password_change'),
      date: formatDate(profile.passwordChangedAt),
    },
  ];

  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight">{t('profile.activity')}</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.label} className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                <activity.icon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{activity.label}</p>
                <p className="text-xs text-muted-foreground">{activity.date}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <CalendarClock className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('profile.member_since')}</p>
              <p className="text-xs text-muted-foreground">{formatDate(profile.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
