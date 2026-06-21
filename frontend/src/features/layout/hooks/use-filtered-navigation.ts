'use client';

import { useMemo } from 'react';
import type { PermissionKey } from '@/constants/permissions';
import {
  NAVIGATION_REGISTRY,
  type NavigationItem,
  type NavigationSection,
} from '@/constants/navigation';
import { usePermissions } from '@/features/auth/hooks/use-permissions';

function canAccessItem(
  item: NavigationItem,
  hasPermission: (key: PermissionKey | PermissionKey[]) => boolean,
  hasAnyPermission: (keys: PermissionKey[]) => boolean,
): boolean {
  if (!item.permission) {
    return true;
  }

  const keys = Array.isArray(item.permission) ? item.permission : [item.permission];

  if (item.permissionMode === 'any') {
    return hasAnyPermission(keys);
  }

  return hasPermission(keys);
}

function filterItems(
  items: NavigationItem[],
  hasPermission: (key: PermissionKey | PermissionKey[]) => boolean,
  hasAnyPermission: (keys: PermissionKey[]) => boolean,
): NavigationItem[] {
  return items
    .filter((item) => canAccessItem(item, hasPermission, hasAnyPermission))
    .map((item) => ({
      ...item,
      children: item.children
        ? filterItems(item.children, hasPermission, hasAnyPermission)
        : undefined,
    }));
}

export function useFilteredNavigation() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  return useMemo(() => {
    const sections: NavigationSection[] = NAVIGATION_REGISTRY.map((section) => ({
      ...section,
      items: filterItems(section.items, hasPermission, hasAnyPermission),
    })).filter((section) => section.items.length > 0);

    return sections;
  }, [hasPermission, hasAnyPermission]);
}
