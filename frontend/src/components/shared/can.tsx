'use client';

import type { PermissionKey } from '@/constants/permissions';
import { usePermissions } from '@/features/auth/hooks/use-permissions';

interface CanProps {
  permission: PermissionKey | PermissionKey[];
  mode?: 'all' | 'any';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Permission-aware render gate for UI elements.
 */
export function Can({ permission, mode = 'all', children, fallback = null }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const keys = Array.isArray(permission) ? permission : [permission];

  const allowed =
    mode === 'any' ? hasAnyPermission(keys) : keys.length === 1 ? hasPermission(keys[0]) : hasAllPermissions(keys);

  return allowed ? <>{children}</> : <>{fallback}</>;
}
