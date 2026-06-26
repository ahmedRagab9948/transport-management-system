/**
 * Status label → visual tone mapping per ui-design-system.md
 */

export type StatusTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

export const TRIP_STATUS_TONES: Record<string, StatusTone> = {
  DRAFT: 'neutral',
  PENDING: 'neutral',
  ASSIGNED: 'info',
  DRIVER_CONFIRMED: 'info',
  LOADING: 'warning',
  ON_ROUTE: 'warning',
  WAITING: 'warning',
  UNLOADING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const VEHICLE_STATUS_TONES: Record<string, StatusTone> = {
  ACTIVE: 'success',
  IN_TRIP: 'warning',
  IN_MAINTENANCE: 'info',
  AVAILABLE: 'success',
  BUSY: 'warning',
  MAINTENANCE: 'info',
  OUT_OF_SERVICE: 'danger',
};

export const DRIVER_STATUS_TONES: Record<string, StatusTone> = {
  ACTIVE: 'success',
  IN_TRIP: 'warning',
  INACTIVE: 'neutral',
  SUSPENDED: 'danger',
};

export const CLIENT_STATUS_TONES: Record<string, StatusTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
};

export const CONTRACT_STATUS_TONES: Record<string, StatusTone> = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  EXPIRED: 'warning',
  TERMINATED: 'danger',
};

export const SECTOR_STATUS_TONES: Record<string, StatusTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
};

export function resolveStatusTone(
  status: string,
  domain: 'trip' | 'vehicle' | 'driver' | 'client' | 'contract' | 'sector' = 'trip',
): StatusTone {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  const map =
    domain === 'vehicle'
      ? VEHICLE_STATUS_TONES
      : domain === 'driver'
        ? DRIVER_STATUS_TONES
        : domain === 'client'
          ? CLIENT_STATUS_TONES
          : domain === 'contract'
            ? CONTRACT_STATUS_TONES
            : domain === 'sector'
              ? SECTOR_STATUS_TONES
              : TRIP_STATUS_TONES;

  return map[normalized] ?? 'neutral';
}
