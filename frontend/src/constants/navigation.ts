import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  History,
  LayoutDashboard,
  Route,
  Settings,
  Truck,
  UserCircle,
  Users,
  BarChart3,
  Contact,
  Monitor,
} from 'lucide-react';
import type { PermissionKey } from './permissions';
import { PERMISSIONS } from './permissions';
import { ROUTES } from './routes';

export type NavigationPermissionMode = 'all' | 'any';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omit to allow all authenticated users */
  permission?: PermissionKey | PermissionKey[];
  permissionMode?: NavigationPermissionMode;
  /** Shown in nav but not clickable until module ships */
  comingSoon?: boolean;
  children?: NavigationItem[];
}

export interface NavigationSection {
  id: string;
  label?: string;
  items: NavigationItem[];
}

/**
 * Central navigation registry — single source for sidebar, breadcrumbs, and route metadata.
 * Filter items at runtime with `useFilteredNavigation()` based on RBAC permissions.
 */
export const NAVIGATION_REGISTRY: NavigationSection[] = [
  {
    id: 'overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: ROUTES.dashboard,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: 'clients',
        label: 'Clients',
        href: ROUTES.clients,
        icon: Contact,
        permission: PERMISSIONS.VIEW_CLIENTS,
      },
      {
        id: 'contracts',
        label: 'Contracts',
        href: ROUTES.contracts,
        icon: FileText,
        permission: PERMISSIONS.VIEW_CONTRACTS,
      },
      {
        id: 'sectors',
        label: 'Sectors',
        href: ROUTES.sectors,
        icon: Route,
        permission: PERMISSIONS.VIEW_SECTORS,
      },
      {
        id: 'dispatch-board',
        label: 'Dispatch Board',
        href: ROUTES.dispatchBoard,
        icon: Monitor,
        permission: PERMISSIONS.VIEW_DISPATCH_BOARD,
      },
      {
        id: 'trips',
        label: 'Trips',
        href: ROUTES.trips,
        icon: Route,
        permission: PERMISSIONS.VIEW_TRIPS,
      },
      {
        id: 'vehicles',
        label: 'Vehicles',
        href: ROUTES.vehicles,
        icon: Truck,
        permission: PERMISSIONS.VIEW_VEHICLES,
      },
      {
        id: 'drivers',
        label: 'Drivers',
        href: ROUTES.drivers,
        icon: UserCircle,
        permission: PERMISSIONS.VIEW_DRIVERS,
      },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    items: [
      {
        id: 'reports',
        label: 'Reports',
        href: ROUTES.reports,
        icon: BarChart3,
        permission: PERMISSIONS.VIEW_REPORTS,
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        href: ROUTES.auditLogs,
        icon: History,
        permission: PERMISSIONS.VIEW_AUDIT_LOGS,
      },
      {
        id: 'users',
        label: 'Users',
        href: ROUTES.users,
        icon: Users,
        permission: PERMISSIONS.VIEW_USERS,
        comingSoon: false,
      },
      {
        id: 'settings',
        label: 'Settings',
        href: ROUTES.settings,
        icon: Settings,
        permission: PERMISSIONS.VIEW_SETTINGS,
      },
    ],
  },
];

/** Flat list of all navigation items (including nested) */
export function flattenNavigationItems(
  sections: NavigationSection[] = NAVIGATION_REGISTRY,
): NavigationItem[] {
  return sections.flatMap((section) =>
    section.items.flatMap((item) => [item, ...(item.children ?? [])]),
  );
}

/** Paths used by middleware for auth protection */
export function getProtectedRoutePrefixes(): string[] {
  const hrefs = flattenNavigationItems().map((item) => item.href);
  return [...new Set(hrefs)];
}

/** Lookup nav item by pathname (exact or prefix for nested routes later) */
export function findNavigationItemByPath(pathname: string): NavigationItem | undefined {
  const items = flattenNavigationItems();
  const exact = items.find((item) => item.href === pathname);
  if (exact) return exact;

  return items
    .filter((item) => item.href !== '/' && pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

export function getBreadcrumbsForPath(pathname: string): { label: string; href?: string; labelKey?: string }[] {
  const item = findNavigationItemByPath(pathname);

  if (!item) {
    return [{ label: 'Dashboard', labelKey: 'nav.dashboard', href: ROUTES.dashboard }];
  }

  if (item.href === ROUTES.dashboard) {
    return [{ label: item.label, labelKey: 'nav.dashboard' }];
  }

  return [
    { label: 'Dashboard', labelKey: 'nav.dashboard', href: ROUTES.dashboard },
    { label: item.label, labelKey: `nav.${item.id}` },
  ];
}
