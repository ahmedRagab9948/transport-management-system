import type { TripStatus } from '../types/trip.types';
import type { PermissionKey } from '@/constants/permissions';

export type TripActionType =
  | 'assign'
  | 'confirm_driver'
  | 'start_loading'
  | 'depart'
  | 'arrived_waiting'
  | 'resume'
  | 'start_unloading'
  | 'complete'
  | 'cancel';

export interface TripActionDefinition {
  type: TripActionType;
  fromStatuses: TripStatus[];
  resolveTarget: (current: TripStatus) => TripStatus;
  permission?: PermissionKey;
  i18nKey: string;
  icon: string;
}

export const LIFECYCLE_ACTIONS: TripActionDefinition[] = [
  {
    type: 'assign',
    fromStatuses: ['PENDING'],
    resolveTarget: () => 'ASSIGNED' as TripStatus,
    i18nKey: 'trips.assign',
    icon: 'UserCheck',
  },
  {
    type: 'confirm_driver',
    fromStatuses: ['ASSIGNED'],
    resolveTarget: () => 'DRIVER_CONFIRMED' as TripStatus,
    permission: 'CONFIRM_DRIVER_ON_BEHALF',
    i18nKey: 'trips.start',
    icon: 'Play',
  },
  {
    type: 'start_loading',
    fromStatuses: ['DRIVER_CONFIRMED'],
    resolveTarget: () => 'LOADING' as TripStatus,
    i18nKey: 'trips.start_loading',
    icon: 'Play',
  },
  {
    type: 'depart',
    fromStatuses: ['LOADING'],
    resolveTarget: () => 'ON_ROUTE' as TripStatus,
    i18nKey: 'trips.depart',
    icon: 'Play',
  },
  {
    type: 'arrived_waiting',
    fromStatuses: ['ON_ROUTE'],
    resolveTarget: () => 'WAITING' as TripStatus,
    i18nKey: 'trips.arrived_waiting',
    icon: 'Clock',
  },
  {
    type: 'resume',
    fromStatuses: ['WAITING'],
    resolveTarget: () => 'ON_ROUTE' as TripStatus,
    i18nKey: 'trips.resume',
    icon: 'Play',
  },
  {
    type: 'start_unloading',
    fromStatuses: ['ON_ROUTE', 'WAITING'],
    resolveTarget: (_current: TripStatus) => 'UNLOADING' as TripStatus,
    i18nKey: 'trips.start_unloading',
    icon: 'Play',
  },
  {
    type: 'complete',
    fromStatuses: ['UNLOADING'],
    resolveTarget: () => 'COMPLETED' as TripStatus,
    i18nKey: 'trips.complete',
    icon: 'CheckCircle2',
  },
  {
    type: 'cancel',
    fromStatuses: ['DRAFT', 'PENDING', 'ASSIGNED', 'DRIVER_CONFIRMED', 'LOADING', 'ON_ROUTE', 'WAITING', 'UNLOADING'],
    resolveTarget: () => 'CANCELLED' as TripStatus,
    i18nKey: 'trips.cancel',
    icon: 'XCircle',
  },
];

export function getAvailableActions(
  currentStatus: TripStatus,
  canEdit: boolean,
  hasPermission: (perm: PermissionKey | PermissionKey[]) => boolean,
): TripActionDefinition[] {
  return LIFECYCLE_ACTIONS.filter((action) => {
    if (!action.fromStatuses.includes(currentStatus)) return false;
    if (action.permission && !hasPermission(action.permission)) return false;
    return canEdit;
  });
}
