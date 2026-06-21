import { BadRequestException } from '@nestjs/common';
import { TripStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  [TripStatus.PENDING]: [TripStatus.ASSIGNED, TripStatus.IN_PROGRESS, TripStatus.CANCELLED],
  [TripStatus.ASSIGNED]: [TripStatus.IN_PROGRESS, TripStatus.CANCELLED],
  [TripStatus.IN_PROGRESS]: [TripStatus.COMPLETED, TripStatus.CANCELLED],
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
