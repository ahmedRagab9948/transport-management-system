import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  FileText,
  Info,
  Route,
  Truck,
  UserCircle,
  Wrench,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export interface NotificationTypeConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}

export const NOTIFICATION_TYPE_MAP: Record<string, NotificationTypeConfig> = {
  TRIP_CREATED: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Trip Created',
  },
  TRIP_ASSIGNED: {
    icon: Route,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    label: 'Trip Assigned',
  },
  TRIP_STATUS_CHANGED: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Status Changed',
  },
  TRIP_COMPLETED: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Trip Completed',
  },
  TRIP_CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Trip Cancelled',
  },
  VEHICLE_MAINTENANCE: {
    icon: Wrench,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'In Maintenance',
  },
  VEHICLE_OUT_OF_SERVICE: {
    icon: Ban,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Out of Service',
  },
  DRIVER_SUSPENDED: {
    icon: Ban,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Driver Suspended',
  },
  DRIVER_INACTIVE: {
    icon: UserCircle,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    label: 'Driver Inactive',
  },
  CONTRACT_EXPIRING: {
    icon: AlertTriangle,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    label: 'Expiring Soon',
  },
  CONTRACT_COMPLETED: {
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    label: 'Contract Completed',
  },
};

export const DEFAULT_NOTIFICATION_CONFIG: NotificationTypeConfig = {
  icon: Info,
  color: 'text-muted-foreground',
  bgColor: 'bg-muted',
  label: 'Notification',
};

export function getNotificationConfig(type: string): NotificationTypeConfig {
  return NOTIFICATION_TYPE_MAP[type] ?? DEFAULT_NOTIFICATION_CONFIG;
}

export function getNotificationLink(entityType: string | null, entityId: string | null): string | null {
  if (!entityType || !entityId) return null;

  const routeMap: Record<string, string> = {
    trip: ROUTES.trips,
    vehicle: ROUTES.vehicles,
    driver: ROUTES.drivers,
    contract: ROUTES.contracts,
    client: ROUTES.clients,
  };

  const basePath = routeMap[entityType];
  if (!basePath) return null;

  return `${basePath}/${entityId}`;
}
