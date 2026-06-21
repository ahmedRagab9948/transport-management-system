import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DriverStatus, NotificationType, Prisma } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { toCsv } from '../../../common/utils/csv';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { NOTIFICATION_EVENTS } from '../../notifications/events/notification-events';
import type { NotificationEvent } from '../../notifications/events/notification-events';
import { CreateDriverDto } from '../dto/create-driver.dto';
import { QueryDriversDto } from '../dto/query-drivers.dto';
import { UpdateDriverStatusDto } from '../dto/update-driver-status.dto';
import { UpdateDriverDto } from '../dto/update-driver.dto';
import {
  DRIVER_ENTITY_TYPE,
  DriverAuditAction,
} from '../enums/driver-audit-action.enum';

const DRIVER_INCLUDE = {
  statusHistories: {
    orderBy: { changedAt: 'desc' as const },
    take: 10,
  },
};

type DriverWithRelations = Prisma.DriverGetPayload<{
  include: typeof DRIVER_INCLUDE;
}>;

@Injectable()
export class DriversService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    dto: CreateDriverDto,
    user: AuthenticatedUser,
  ): Promise<DriverWithRelations> {
    await this.assertUniqueFields(dto.phone, dto.nationalId, dto.driverCode);

    try {
      const driver = await this.prisma.$transaction(async (tx) => {
        const created = await tx.driver.create({
          data: {
            driverCode: dto.driverCode.trim(),
            fullName: dto.fullName.trim(),
            phone: dto.phone.trim(),
            nationalId: dto.nationalId.trim(),
            licenseNumber: dto.licenseNumber.trim(),
            licenseExpiry: new Date(dto.licenseExpiry),
            status: dto.status ?? DriverStatus.ACTIVE,
            notes: dto.notes?.trim(),
            statusHistories: {
              create: {
                oldStatus: null,
                newStatus: dto.status ?? DriverStatus.ACTIVE,
                changedById: user.id,
                notes: 'Driver created',
              },
            },
          },
          include: DRIVER_INCLUDE,
        });

        return created;
      });

      await this.log(DriverAuditAction.CREATE, user.id, driver.id, {
        driverCode: driver.driverCode,
        fullName: driver.fullName,
        phone: driver.phone,
        nationalId: driver.nationalId,
        status: driver.status,
      });

      return driver;
    } catch (error) {
      this.handleKnownPrismaError(error);
      throw error;
    }
  }

  async findAll(query: QueryDriversDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.driver.findMany({
        where,
        include: DRIVER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.driver.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<DriverWithRelations> {
    const driver = await this.prisma.driver.findFirst({
      where: { id, deletedAt: null },
      include: DRIVER_INCLUDE,
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async update(
    id: string,
    dto: UpdateDriverDto,
    user: AuthenticatedUser,
  ): Promise<DriverWithRelations> {
    const existing = await this.findOne(id);

    if (dto.status === DriverStatus.IN_TRIP) {
      throw new BadRequestException('IN_TRIP can only be assigned by the trip workflow');
    }

    if (dto.phone || dto.nationalId || dto.driverCode) {
      await this.assertUniqueFields(
        dto.phone ?? existing.phone,
        dto.nationalId ?? existing.nationalId,
        dto.driverCode ?? existing.driverCode,
        id,
      );
    }

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.driver.update({
          where: { id },
          data: {
            driverCode: dto.driverCode?.trim(),
            fullName: dto.fullName?.trim(),
            phone: dto.phone?.trim(),
            nationalId: dto.nationalId?.trim(),
            licenseNumber: dto.licenseNumber?.trim(),
            licenseExpiry: dto.licenseExpiry
              ? new Date(dto.licenseExpiry)
              : undefined,
            status: dto.status,
            notes: dto.notes?.trim(),
          },
        });

        if (dto.status) {
          await tx.driverStatusHistory.create({
            data: {
              driverId: id,
              oldStatus: existing.status,
              newStatus: dto.status,
              changedById: user.id,
              notes: 'Status updated via driver edit',
            },
          });
        }

        return tx.driver.findFirstOrThrow({
          where: { id, deletedAt: null },
          include: DRIVER_INCLUDE,
        });
      });

      await this.log(DriverAuditAction.UPDATE, user.id, id, {
        oldValues: this.toAuditSnapshot(existing),
        newValues: this.toAuditSnapshot(updated),
      });

      if (dto.status && (dto.status === DriverStatus.SUSPENDED || dto.status === DriverStatus.INACTIVE)) {
        const eventName = dto.status === DriverStatus.SUSPENDED
          ? NOTIFICATION_EVENTS.DRIVER_SUSPENDED
          : NOTIFICATION_EVENTS.DRIVER_INACTIVE;
        const notifType = dto.status === DriverStatus.SUSPENDED
          ? NotificationType.DRIVER_SUSPENDED
          : NotificationType.DRIVER_INACTIVE;
        const event: NotificationEvent = {
          eventName,
          notificationType: notifType,
          recipients: [user.id],
          payload: {
            entityType: DRIVER_ENTITY_TYPE,
            entityId: id,
            title: `Driver ${updated.fullName} ${dto.status === DriverStatus.SUSPENDED ? 'suspended' : 'inactive'}`,
            message: `Driver ${updated.fullName} status changed from ${existing.status.toLowerCase()} to ${dto.status.toLowerCase()}`,
            driverName: updated.fullName,
            oldStatus: existing.status,
            newStatus: dto.status,
          },
        };
        this.eventEmitter.emit(event.eventName, event);
      }

      return updated;
    } catch (error) {
      this.handleKnownPrismaError(error);
      throw error;
    }
  }

  async updateStatus(
    id: string,
    dto: UpdateDriverStatusDto,
    user: AuthenticatedUser,
  ): Promise<DriverWithRelations> {
    const existing = await this.findOne(id);

    if (existing.status === dto.status) {
      throw new BadRequestException('Driver already has this status');
    }

    if (dto.status === DriverStatus.IN_TRIP) {
      throw new BadRequestException('IN_TRIP can only be assigned by the trip workflow');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.driver.update({
        where: { id },
        data: { status: dto.status },
      });

      await tx.driverStatusHistory.create({
        data: {
          driverId: id,
          oldStatus: existing.status,
          newStatus: dto.status,
          changedById: user.id,
          notes: dto.notes?.trim(),
        },
      });

      return tx.driver.findFirstOrThrow({
        where: { id, deletedAt: null },
        include: DRIVER_INCLUDE,
      });
    });

    await this.log(DriverAuditAction.STATUS_CHANGE, user.id, id, {
      oldStatus: existing.status,
      newStatus: updated.status,
      notes: dto.notes,
    });

    if (updated.status === DriverStatus.SUSPENDED || updated.status === DriverStatus.INACTIVE) {
      const eventName = updated.status === DriverStatus.SUSPENDED
        ? NOTIFICATION_EVENTS.DRIVER_SUSPENDED
        : NOTIFICATION_EVENTS.DRIVER_INACTIVE;
      const notifType = updated.status === DriverStatus.SUSPENDED
        ? NotificationType.DRIVER_SUSPENDED
        : NotificationType.DRIVER_INACTIVE;

      const event: NotificationEvent = {
        eventName,
        notificationType: notifType,
        recipients: [user.id],
        payload: {
          entityType: DRIVER_ENTITY_TYPE,
          entityId: id,
          title: `Driver ${updated.fullName} ${updated.status === DriverStatus.SUSPENDED ? 'suspended' : 'inactive'}`,
          message: `Driver ${updated.fullName} status changed from ${existing.status.toLowerCase()} to ${updated.status.toLowerCase()}`,
          driverName: updated.fullName,
          oldStatus: existing.status,
          newStatus: updated.status,
        },
      };
      this.eventEmitter.emit(event.eventName, event);
    }

    return updated;
  }

  async remove(
    id: string,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    if (user.roleName !== 'admin') {
      throw new ForbiddenException('Only admins can delete drivers');
    }

    const existing = await this.findOne(id);
    const deletedAt = new Date();

    await this.prisma.driver.update({
      where: { id },
      data: { deletedAt },
    });

    await this.log(DriverAuditAction.DELETE, user.id, id, {
      oldValues: this.toAuditSnapshot(existing),
      deletedAt,
    });

    return { message: 'Driver deleted successfully' };
  }

  private async assertUniqueFields(
    phone: string,
    nationalId: string,
    driverCode: string,
    excludeId?: string,
  ): Promise<void> {
    const where: Prisma.DriverWhereInput = {
      deletedAt: null,
      OR: [{ phone }, { nationalId }, { driverCode }],
      ...(excludeId ? { id: { not: excludeId } } : {}),
    };

    const existing = await this.prisma.driver.findFirst({ where });

    if (existing) {
      if (existing.phone === phone) {
        throw new ConflictException('Phone number is already in use');
      }
      if (existing.nationalId === nationalId) {
        throw new ConflictException('National ID is already in use');
      }
      if (existing.driverCode === driverCode) {
        throw new ConflictException('Driver code is already in use');
      }
    }
  }

  private buildWhere(query: QueryDriversDto): Prisma.DriverWhereInput {
    const where: Prisma.DriverWhereInput = {
      deletedAt: null,
    };

    if (query.availableOnly) {
      where.status = DriverStatus.ACTIVE;
    } else if (query.status) {
      where.status = query.status;
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async log(
    action: DriverAuditAction,
    userId: string,
    entityId: string,
    values?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.auditService.log({
      userId,
      action,
      entityType: DRIVER_ENTITY_TYPE,
      entityId,
      newValues: values,
    });
  }

  private toAuditSnapshot(
    driver: DriverWithRelations,
  ): Prisma.InputJsonObject {
    return {
      id: driver.id,
      driverCode: driver.driverCode,
      fullName: driver.fullName,
      phone: driver.phone,
      nationalId: driver.nationalId,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      status: driver.status,
      notes: driver.notes,
    };
  }

  async exportCsv(): Promise<string> {
    const drivers = await this.prisma.driver.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const rows = drivers.map((d) => ({
      driverCode: d.driverCode,
      fullName: d.fullName,
      phone: d.phone,
      nationalId: d.nationalId,
      licenseNumber: d.licenseNumber,
      licenseExpiry: d.licenseExpiry.toISOString(),
      status: d.status,
      notes: d.notes ?? '',
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    return toCsv(rows);
  }

  private handleKnownPrismaError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const meta = error.meta as { target?: string[] } | undefined;
      const target = meta?.target ?? [];
      if (target.includes('driverCode')) {
        throw new ConflictException('Driver code is already in use');
      }
      throw new ConflictException('Phone number or national ID already exists');
    }
  }
}
