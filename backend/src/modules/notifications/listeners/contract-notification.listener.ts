import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ENTITY_TYPES, THIRTY_DAYS_MS } from '@tms/shared';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { NOTIFICATION_EVENTS } from '../events/notification-events';
import type { NotificationEvent } from '../events/notification-events';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class ContractNotificationListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(NOTIFICATION_EVENTS.CONTRACT_EXPIRING, { async: true })
  async handleContractExpiring(event: NotificationEvent) {
    await this.createNotifications(event);
  }

  @OnEvent(NOTIFICATION_EVENTS.CONTRACT_COMPLETED, { async: true })
  async handleContractCompleted(event: NotificationEvent) {
    await this.createNotifications(event);
  }

  async checkExpiringContracts() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + THIRTY_DAYS_MS);

    const expiringContracts = await this.prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
        deletedAt: null,
      },
      include: { client: { select: { companyName: true } } },
    });

    for (const contract of expiringContracts) {
      const daysUntilExpiry = Math.ceil(
        (contract.endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      const recipients = await this.resolveRecipients([]);
      await Promise.all(
        recipients.map((userId: string) =>
          this.notificationsService.create({
            userId,
            title: `Contract "${contract.contractNumber}" expiring soon`,
            message: `Contract "${contract.title}" for ${contract.client?.companyName ?? 'N/A'} expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} (${contract.endDate!.toISOString().split('T')[0]})`,
            type: NotificationType.CONTRACT_EXPIRING,
            entityType: ENTITY_TYPES.CONTRACT,
            entityId: contract.id,
          }),
        ),
      );
    }

    return { checked: expiringContracts.length };
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
        where: { isActive: true, deletedAt: null, role: { name: { in: ['admin', 'manager'] } } },
        select: { id: true },
      });
      return users.map((u: { id: string }) => u.id);
    }
    return ids;
  }
}
