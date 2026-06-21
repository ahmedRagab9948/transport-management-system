'use client';

import type { PermissionKey } from '@/constants/permissions';
import { useAuth } from './use-auth';

export function usePermissions() {
  const { user, hasPermission } = useAuth();

  return {
    permissions: user?.permissions ?? [],
    hasPermission,
    hasAnyPermission: (keys: PermissionKey[]) => keys.some((key) => hasPermission(key)),
    hasAllPermissions: (keys: PermissionKey[]) => keys.every((key) => hasPermission(key)),
  };
}
