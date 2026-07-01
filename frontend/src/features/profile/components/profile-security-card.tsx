'use client';

import { KeyRound, LogOut, Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useT } from '@/lib/i18n';
import type { Profile } from '../types/profile.types';

interface ProfileSecurityCardProps {
  profile?: Profile;
  isLoading: boolean;
  onChangePassword: () => void;
}

export function ProfileSecurityCard({ profile, isLoading, onChangePassword }: ProfileSecurityCardProps) {
  const { t } = useT();
  const { logoutAll } = useAuth();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/40 bg-muted/20 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight">{t('profile.security')}</h2>
      </div>
      <div className="divide-y divide-border/40">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t('profile.password')}</p>
              <p className="text-xs text-muted-foreground">{t('profile.password_description')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onChangePassword}>
            {t('profile.change')}
          </Button>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t('profile.mfa')}</p>
              <p className="text-xs text-muted-foreground">
                {profile.mfaEnabled ? t('profile.mfa_enabled') : t('profile.mfa_disabled')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {profile.mfaEnabled ? (
              <ShieldCheck className="size-4 text-green-500" />
            ) : (
              <Shield className="size-4 text-muted-foreground" />
            )}
            {profile.mfaEnabled ? t('common.active') : t('common.inactive')}
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-start gap-3">
            <LogOut className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t('profile.active_sessions')}</p>
              <p className="text-xs text-muted-foreground">{t('profile.active_sessions_description')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => logoutAll()}>
            {t('profile.logout_all')}
          </Button>
        </div>
      </div>
    </div>
  );
}
