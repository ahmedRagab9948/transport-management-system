import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { NOTIFICATION_EVENTS } from '../events/notification-events';
import type { NotificationEvent } from '../events/notification-events';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class TripNotificationListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(NOTIFICATION_EVENTS.TRIP_CREATED, { async: true })
  async handleTripCreated(event: NotificationEvent) {
    await this.createNotifications(event);
  }

  @OnEvent(NOTIFICATION_EVENTS.TRIP_ASSIGNED, { async: true })
  async handleTripAssigned(event: NotificationEvent) {
    await this.createNotifications(event);
  }

  @OnEvent(NOTIFICATION_EVENTS.TRIP_STATUS_CHANGED, { async: true })
  async handleTripStatusChanged(event: NotificationEvent) {
    await this.createNotifications(event);
  }

  @OnEvent(NOTIFICATION_EVENTS.TRIP_COMPLETED, { async: true })
  async handleTripCompleted(event: NotificationEvent) {
    await this.createNotifications(event);
  }

  @OnEvent(NOTIFICATION_EVENTS.TRIP_CANCELLED, { async: true })
  async handleTripCancelled(event: NotificationEvent) {
    await this.createNotifications(event);
  }

  private async createNotifications(event: NotificationEvent) {
    const recipients = await this.resolveRecipients(event.recipients);
    await Promise.all(
      recipients.map((userId: string) =>
        this.notificationsService.create({
          userId,
          title: event.payload.title,
          message: event.payload.message,
          type: event.notificationType,
          entityType: event.payload.entityType,
          entityId: event.payload.entityId,
        }),
      ),
    );
  }

  private async resolveRecipients(ids: string[]) {
    if (ids.length === 0) {
      const users = await this.prisma.user.findMany({
        where: { isActive: true, deletedAt: null, role: { name: { in: ['admin', 'dispatcher'] } } },
        select: { id: true },
      });
      return users.map((u: { id: string }) => u.id);
    }
    return ids;
  }
}
