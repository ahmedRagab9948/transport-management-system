import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { QueryNotificationsDto, MarkReadDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryNotificationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      archivedAt: null,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, readAt: null, archivedAt: null },
    });
  }

  async markAsRead(userId: string, dto: MarkReadDto) {
    if (dto.notificationIds?.length) {
      await this.prisma.notification.updateMany({
        where: { id: { in: dto.notificationIds }, userId },
        data: { readAt: new Date() },
      });
    }
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null, archivedAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async create(data: {
    userId: string;
    title: string;
    message?: string;
    type: NotificationType;
    entityType?: string;
    entityId?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async archiveOldNotifications(daysOld: number = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const result = await this.prisma.notification.updateMany({
      where: { createdAt: { lt: cutoff }, archivedAt: null },
      data: { archivedAt: new Date() },
    });

    return { archivedCount: result.count };
  }
}
