import { TripStatus } from '@prisma/client';

/** Trip statuses that represent an active, in-progress trip (non-terminal, resources locked). */
export const ACTIVE_TRIP_STATUSES: readonly TripStatus[] = [
  TripStatus.ASSIGNED,
  TripStatus.DRIVER_CONFIRMED,
  TripStatus.LOADING,
  TripStatus.ON_ROUTE,
  TripStatus.WAITING,
  TripStatus.UNLOADING,
] as const;
