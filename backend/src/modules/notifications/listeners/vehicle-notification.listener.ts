import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { NOTIFICATION_EVENTS } from '../events/notification-events';
import type { NotificationEvent } from '../events/notification-events';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class VehicleNotificationListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(NOTIFICATION_EVENTS.VEHICLE_MAINTENANCE, { async: true })
  async handleVehicleMaintenance(event: NotificationEvent) {
    await this.createNotifications(event);
  }

  @OnEvent(NOTIFICATION_EVENTS.VEHICLE_OUT_OF_SERVICE, { async: true })
  async handleVehicleOutOfService(event: NotificationEvent) {
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
