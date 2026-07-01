'use client';

import { motion } from 'framer-motion';
import { CalendarDays, Clock, Pencil, Shield } from 'lucide-react';
import { StatusBadge } from '@/components/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Profile } from '../types/profile.types';

interface ProfileHeaderProps {
  profile?: Profile;
  isLoading: boolean;
  onEditProfile: () => void;
  onChangePassword: () => void;
}

export function ProfileHeader({ profile, isLoading, onEditProfile, onChangePassword }: ProfileHeaderProps) {
  const { t, isRTL } = useT();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2 sm:justify-end">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(profile.createdAt).toLocaleDateString(
    profile.preferredLanguage === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'long' },
  );

  const lastLogin = profile.lastLoginAt
    ? new Date(profile.lastLoginAt).toLocaleDateString(
        profile.preferredLanguage === 'ar' ? 'ar-EG' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 rounded-xl border border-border/60 bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Avatar className="size-20 border-2 border-border">
          <AvatarImage src={profile.avatar ?? undefined} alt={profile.fullName} />
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col items-center gap-1 sm:items-start">
          <h1 className="text-xl font-semibold tracking-tight">{profile.fullName}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Shield className="size-3" />
              {profile.role.name}
            </Badge>
            <StatusBadge status={profile.isActive ? 'active' : 'inactive'} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {lastLogin ? (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {t('profile.last_login')}: {lastLogin}
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3" />
              {t('profile.member_since')}: {memberSince}
            </span>
          </div>
        </div>
      </div>
      <div className={cn('flex flex-wrap gap-2', isRTL ? 'sm:justify-start' : 'sm:justify-end')}>
        <Button variant="outline" size="sm" onClick={onEditProfile}>
          <Pencil className="size-4" />
          {t('profile.edit_profile')}
        </Button>
        <Button variant="outline" size="sm" onClick={onChangePassword}>
          <Shield className="size-4" />
          {t('profile.change_password')}
        </Button>
      </div>
    </motion.div>
  );
}
