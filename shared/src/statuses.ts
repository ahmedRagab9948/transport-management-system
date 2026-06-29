export const TRIP_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  DRIVER_CONFIRMED: 'DRIVER_CONFIRMED',
  LOADING: 'LOADING',
  ON_ROUTE: 'ON_ROUTE',
  WAITING: 'WAITING',
  UNLOADING: 'UNLOADING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type TripStatus = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];

export const VEHICLE_STATUS = {
  ACTIVE: 'ACTIVE',
  IN_TRIP: 'IN_TRIP',
  IN_MAINTENANCE: 'IN_MAINTENANCE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
} as const;
export type VehicleStatus = (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

export const DRIVER_STATUS = {
  ACTIVE: 'ACTIVE',
  IN_TRIP: 'IN_TRIP',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;
export type DriverStatus = (typeof DRIVER_STATUS)[keyof typeof DRIVER_STATUS];

export const CONTRACT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
} as const;
export type ContractStatus = (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS];

export const CLIENT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type ClientStatus = (typeof CLIENT_STATUS)[keyof typeof CLIENT_STATUS];

export const RECORD_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type RecordStatus = (typeof RECORD_STATUS)[keyof typeof RECORD_STATUS];
