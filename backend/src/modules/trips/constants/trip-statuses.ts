import { ACTIVE_TRIP_STATUSES as SHARED_ACTIVE_TRIP_STATUSES } from '@tms/shared';
import type { TripStatus } from '@prisma/client';

/** Trip statuses that represent an active, in-progress trip (non-terminal, resources locked). */
export const ACTIVE_TRIP_STATUSES: readonly TripStatus[] = SHARED_ACTIVE_TRIP_STATUSES as unknown as readonly TripStatus[];
