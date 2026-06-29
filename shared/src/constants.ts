import { TRIP_STATUS } from './statuses';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 1000;

export const ACTIVE_TRIP_STATUSES = [
  TRIP_STATUS.ASSIGNED,
  TRIP_STATUS.DRIVER_CONFIRMED,
  TRIP_STATUS.LOADING,
  TRIP_STATUS.ON_ROUTE,
  TRIP_STATUS.WAITING,
  TRIP_STATUS.UNLOADING,
] as const;

export const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;
export const THIRTY_DAYS_MS = 30 * DAY_MS;

export const VEHICLE_PREFIX = 'TRK-';
export const DRIVER_PREFIX = 'DRV-';
export const CONTRACT_PREFIX = 'CON-';
export const TRIP_PREFIX = 'TRP-';
