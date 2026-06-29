import { ENTITY_TYPES } from '@tms/shared';

export const TRIP_ENTITY_TYPE = ENTITY_TYPES.TRIP;

export enum TripAuditAction {
  CREATE = 'TRIP.CREATE',
  UPDATE = 'TRIP.UPDATE',
  STATUS_CHANGE = 'TRIP.STATUS_CHANGE',
  DELETE = 'TRIP.DELETE',
}
