import { BadRequestException } from '@nestjs/common';
import { TripStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  [TripStatus.DRAFT]: [TripStatus.PENDING, TripStatus.CANCELLED],
  [TripStatus.PENDING]: [TripStatus.ASSIGNED, TripStatus.CANCELLED],
  [TripStatus.ASSIGNED]: [TripStatus.DRIVER_CONFIRMED, TripStatus.CANCELLED],
  [TripStatus.DRIVER_CONFIRMED]: [TripStatus.LOADING, TripStatus.CANCELLED],
  [TripStatus.LOADING]: [TripStatus.ON_ROUTE, TripStatus.CANCELLED],
  [TripStatus.ON_ROUTE]: [TripStatus.WAITING, TripStatus.UNLOADING, TripStatus.CANCELLED],
  [TripStatus.WAITING]: [TripStatus.ON_ROUTE, TripStatus.UNLOADING, TripStatus.CANCELLED],
  [TripStatus.UNLOADING]: [TripStatus.COMPLETED, TripStatus.CANCELLED],
  [TripStatus.COMPLETED]: [],
  [TripStatus.CANCELLED]: [],
};

export function validateTransition(from: TripStatus, to: TripStatus): void {
  if (from === to) {
    throw new BadRequestException('Trip already has this status');
  }

  const allowed = VALID_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    const allowedList = allowed.length > 0 ? allowed.join(', ') : 'none (terminal status)';
    throw new BadRequestException(
      `Cannot transition trip from ${from} to ${to}. ` +
      `Allowed transitions from ${from}: ${allowedList}`,
    );
  }
}
