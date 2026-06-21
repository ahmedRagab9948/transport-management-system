import { NotificationType } from '@prisma/client';

export const NOTIFICATION_EVENTS = {
  TRIP_CREATED: 'notification.trip.created',
  TRIP_ASSIGNED: 'notification.trip.assigned',
  TRIP_STATUS_CHANGED: 'notification.trip.status_changed',
  TRIP_COMPLETED: 'notification.trip.completed',
  TRIP_CANCELLED: 'notification.trip.cancelled',
  VEHICLE_MAINTENANCE: 'notification.vehicle.maintenance',
  VEHICLE_OUT_OF_SERVICE: 'notification.vehicle.out_of_service',
  DRIVER_SUSPENDED: 'notification.driver.suspended',
  DRIVER_INACTIVE: 'notification.driver.inactive',
  CONTRACT_EXPIRING: 'notification.contract.expiring',
  CONTRACT_COMPLETED: 'notification.contract.completed',
} as const;

export type NotificationEventName = (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];

export interface BaseNotificationPayload {
  entityType: string;
  entityId: string;
  title: string;
  message?: string;
  performedByUserId?: string;
}

export interface TripNotificationPayload extends BaseNotificationPayload {
  tripNumber: string;
  oldStatus?: string;
  newStatus: string;
}

export interface VehicleNotificationPayload extends BaseNotificationPayload {
  vehicleCode: string;
  oldStatus: string;
  newStatus: string;
}

export interface DriverNotificationPayload extends BaseNotificationPayload {
  driverName: string;
  oldStatus: string;
  newStatus: string;
}

export interface ContractNotificationPayload extends BaseNotificationPayload {
  contractNumber: string;
  status: string;
  endDate?: string;
}

export type NotificationPayload =
  | TripNotificationPayload
  | VehicleNotificationPayload
  | DriverNotificationPayload
  | ContractNotificationPayload;

export interface NotificationEvent {
  eventName: string;
  notificationType: NotificationType;
  recipients: string[];
  payload: NotificationPayload;
}
