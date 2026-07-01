'use client';

import { lazy, Suspense, useState } from 'react';
import { PageHeader, PageSection } from '@/components/shared';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { useT } from '@/lib/i18n';
import { ProfileActivityCard } from '../components/profile-activity-card';
import { ProfileHeader } from '../components/profile-header';
import { ProfileInformationCard } from '../components/profile-information-card';
import { ProfilePermissionsCard } from '../components/profile-permissions-card';
import { ProfileSecurityCard } from '../components/profile-security-card';
import { useProfile } from '../hooks/use-profile';

const ChangePasswordDialog = lazy(() =>
  import('../components/change-password-dialog').then((m) => ({ default: m.ChangePasswordDialog })),
);

const EditProfileDialog = lazy(() =>
  import('../components/edit-profile-dialog').then((m) => ({ default: m.EditProfileDialog })),
);

export function ProfilePage() {
  const { t } = useT();
  const { data: profile, isLoading } = useProfile();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader title={t('profile.title')} description={t('profile.page_description')} />

      <ProfileHeader
        profile={profile}
        isLoading={isLoading}
        onEditProfile={() => setEditProfileOpen(true)}
        onChangePassword={() => setChangePasswordOpen(true)}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileInformationCard profile={profile} isLoading={isLoading} />
        <ProfileSecurityCard
          profile={profile}
          isLoading={isLoading}
          onChangePassword={() => setChangePasswordOpen(true)}
        />
      </div>

      <ProfilePermissionsCard profile={profile} isLoading={isLoading} />

      <ProfileActivityCard profile={profile} isLoading={isLoading} />

      {changePasswordOpen ? (
        <Suspense fallback={null}>
          <ChangePasswordDialog
            open={changePasswordOpen}
            onOpenChange={setChangePasswordOpen}
          />
        </Suspense>
      ) : null}

      {editProfileOpen && profile ? (
        <Suspense fallback={null}>
          <EditProfileDialog
            open={editProfileOpen}
            onOpenChange={setEditProfileOpen}
            profile={profile}
          />
        </Suspense>
      ) : null}
    </PageSection>
  );
}
