import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType, Prisma, VehiclePlateRole, VehicleStatus, VehicleType } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { toCsv } from '../../../common/utils/csv';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { NOTIFICATION_EVENTS } from '../../notifications/events/notification-events';
import type { NotificationEvent } from '../../notifications/events/notification-events';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { QueryVehiclesDto } from '../dto/query-vehicles.dto';
import { UpdateVehicleStatusDto } from '../dto/update-vehicle-status.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehiclePlateDto } from '../dto/vehicle-plate.dto';
import {
  VEHICLE_ENTITY_TYPE,
  VehicleAuditAction,
} from '../enums/vehicle-audit-action.enum';

const VEHICLE_INCLUDE = {
  plates: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' as const },
  },
  statusHistories: {
    orderBy: { changedAt: 'desc' as const },
    take: 10,
  },
  assignedDriver: {
    select: { id: true, fullName: true, driverCode: true },
  },
};

type VehicleWithRelations = Prisma.VehicleGetPayload<{
  include: typeof VEHICLE_INCLUDE;
}>;

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    dto: CreateVehicleDto,
    user: AuthenticatedUser,
  ): Promise<VehicleWithRelations> {
    if (dto.assignedDriverId) {
      await this.assertDriverExists(dto.assignedDriverId);
      await this.assertDriverActive(dto.assignedDriverId);
      await this.assertDriverNotAssignedElsewhere(dto.assignedDriverId);
    }

    const plates = this.normalizeAndValidatePlates(dto.type, dto.plates);

    try {
      const vehicle = await this.prisma.$transaction(async (tx) => {
        const created = await tx.vehicle.create({
          data: {
            vehicleCode: dto.vehicleCode.trim(),
            type: dto.type,
            status: dto.status ?? VehicleStatus.ACTIVE,
            manufacturer: dto.manufacturer?.trim(),
            model: dto.model?.trim(),
            productionYear: dto.productionYear,
            capacityKg: dto.capacityKg,
            notes: dto.notes?.trim(),
            assignedDriverId: dto.assignedDriverId,
            plates: {
              create: plates,
            },
            statusHistories: {
              create: {
                oldStatus: null,
                newStatus: dto.status ?? VehicleStatus.ACTIVE,
                changedById: user.id,
                notes: 'Vehicle created',
              },
            },
          },
          include: VEHICLE_INCLUDE,
        });

        return created;
      });

      await this.log(VehicleAuditAction.CREATE, user.id, vehicle.id, {
        vehicleCode: vehicle.vehicleCode,
        type: vehicle.type,
        status: vehicle.status,
      });

      return vehicle;
    } catch (error) {
      this.handleKnownPrismaError(error);
      throw error;
    }
  }

  async findAll(query: QueryVehiclesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        include: VEHICLE_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.vehicle.count({ where }),
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

  async findOne(id: string): Promise<VehicleWithRelations> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
      include: VEHICLE_INCLUDE,
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(
    id: string,
    dto: UpdateVehicleDto,
    user: AuthenticatedUser,
  ): Promise<VehicleWithRelations> {
    const existing = await this.findOne(id);

    if (dto.assignedDriverId !== undefined) {
      if (dto.assignedDriverId === null) {
        // explicitly clearing the assignment — allow
      } else {
        await this.assertDriverExists(dto.assignedDriverId);
        await this.assertDriverActive(dto.assignedDriverId);
        await this.assertDriverNotAssignedElsewhere(dto.assignedDriverId, id);
      }
    }

    const nextType = dto.type ?? existing.type;
    const plates = dto.plates
      ? this.normalizeAndValidatePlates(nextType, dto.plates)
      : undefined;

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.vehicle.update({
          where: { id },
          data: {
            vehicleCode: dto.vehicleCode?.trim(),
            type: dto.type,
            manufacturer: dto.manufacturer?.trim(),
            model: dto.model?.trim(),
            productionYear: dto.productionYear,
            capacityKg: dto.capacityKg,
            notes: dto.notes?.trim(),
            assignedDriverId: dto.assignedDriverId,
          },
        });

        if (plates) {
          const desiredRoles = plates.map((plate) => plate.role);

          await tx.vehiclePlate.updateMany({
            where: {
              vehicleId: id,
              role: { notIn: desiredRoles },
              deletedAt: null,
            },
            data: { deletedAt: new Date() },
          });

          for (const plate of plates) {
            await tx.vehiclePlate.upsert({
              where: {
                vehicleId_role: {
                  vehicleId: id,
                  role: plate.role,
                },
              },
              update: {
                plateNumber: plate.plateNumber,
                deletedAt: null,
              },
              create: {
                vehicleId: id,
                role: plate.role,
                plateNumber: plate.plateNumber,
              },
            });
          }
        }

        return tx.vehicle.findFirstOrThrow({
          where: { id, deletedAt: null },
          include: VEHICLE_INCLUDE,
        });
      });

      await this.log(VehicleAuditAction.UPDATE, user.id, id, {
        oldValues: this.toAuditSnapshot(existing),
        newValues: this.toAuditSnapshot(updated),
      });

      return updated;
    } catch (error) {
      this.handleKnownPrismaError(error);
      throw error;
    }
  }

  async updateStatus(
    id: string,
    dto: UpdateVehicleStatusDto,
    user: AuthenticatedUser,
  ): Promise<VehicleWithRelations> {
    const existing = await this.findOne(id);

    if (existing.status === dto.status) {
      throw new BadRequestException('Vehicle already has this status');
    }

    if (dto.status === VehicleStatus.IN_TRIP) {
      throw new BadRequestException('IN_TRIP can only be assigned by the trip workflow');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.vehicle.update({
        where: { id },
        data: { status: dto.status },
      });

      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: id,
          oldStatus: existing.status,
          newStatus: dto.status,
          changedById: user.id,
          notes: dto.notes?.trim(),
        },
      });

      return tx.vehicle.findFirstOrThrow({
        where: { id, deletedAt: null },
        include: VEHICLE_INCLUDE,
      });
    });

    await this.log(VehicleAuditAction.STATUS_CHANGE, user.id, id, {
      oldStatus: existing.status,
      newStatus: updated.status,
      notes: dto.notes,
    });

    if (updated.status === VehicleStatus.IN_MAINTENANCE || updated.status === VehicleStatus.OUT_OF_SERVICE) {
      const eventName = updated.status === VehicleStatus.IN_MAINTENANCE
        ? NOTIFICATION_EVENTS.VEHICLE_MAINTENANCE
        : NOTIFICATION_EVENTS.VEHICLE_OUT_OF_SERVICE;
      const notifType = updated.status === VehicleStatus.IN_MAINTENANCE
        ? NotificationType.VEHICLE_MAINTENANCE
        : NotificationType.VEHICLE_OUT_OF_SERVICE;

      const event: NotificationEvent = {
        eventName,
        notificationType: notifType,
        recipients: [user.id],
        payload: {
          entityType: VEHICLE_ENTITY_TYPE,
          entityId: id,
          title: `Vehicle ${updated.vehicleCode} ${updated.status === VehicleStatus.IN_MAINTENANCE ? 'entered maintenance' : 'out of service'}`,
          message: `Vehicle ${updated.vehicleCode} status changed from ${existing.status.toLowerCase().replace(/_/g, ' ')} to ${updated.status.toLowerCase().replace(/_/g, ' ')}`,
          vehicleCode: updated.vehicleCode,
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
      throw new ForbiddenException('Only admins can delete vehicles');
    }

    const existing = await this.findOne(id);
    const deletedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.vehicle.update({
        where: { id },
        data: { deletedAt },
      }),
      this.prisma.vehiclePlate.updateMany({
        where: { vehicleId: id, deletedAt: null },
        data: { deletedAt },
      }),
    ]);

    await this.log(VehicleAuditAction.DELETE, user.id, id, {
      oldValues: this.toAuditSnapshot(existing),
      deletedAt,
    });

    return { message: 'Vehicle deleted successfully' };
  }

  private buildWhere(query: QueryVehiclesDto): Prisma.VehicleWhereInput {
    const where: Prisma.VehicleWhereInput = {
      deletedAt: null,
    };

    if (query.vehicleType) {
      where.type = query.vehicleType;
    }

    if (query.availableOnly) {
      where.status = VehicleStatus.ACTIVE;
    } else if (query.status) {
      where.status = query.status;
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { vehicleCode: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        {
          plates: {
            some: {
              deletedAt: null,
              plateNumber: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    return where;
  }

  private normalizeAndValidatePlates(
    type: VehicleType,
    plates: VehiclePlateDto[],
  ): { role: VehiclePlateRole; plateNumber: string }[] {
    const normalized = plates.map((plate) => ({
      role: plate.role,
      plateNumber: plate.plateNumber.trim(),
    }));

    if (normalized.some((plate) => plate.plateNumber.length === 0)) {
      throw new BadRequestException('Plate number cannot be empty');
    }

    const roles = normalized.map((plate) => plate.role);
    const uniqueRoles = new Set(roles);
    const uniquePlateNumbers = new Set(
      normalized.map((plate) => plate.plateNumber.toUpperCase()),
    );

    if (uniqueRoles.size !== roles.length) {
      throw new BadRequestException('Vehicle plate roles must be unique');
    }

    if (uniquePlateNumbers.size !== normalized.length) {
      throw new BadRequestException('Vehicle plate numbers must be unique');
    }

    if (type === VehicleType.TRAILER) {
      const required = [
        VehiclePlateRole.TRUCK_HEAD,
        VehiclePlateRole.TRAILER_UNIT,
      ];
      const valid =
        normalized.length === 2 &&
        required.every((role) => uniqueRoles.has(role));

      if (!valid) {
        throw new BadRequestException(
          'TRAILER vehicles require exactly one TRUCK_HEAD plate and one TRAILER_UNIT plate',
        );
      }
    }

    if (type === VehicleType.JUMBO) {
      const valid =
        normalized.length === 1 && uniqueRoles.has(VehiclePlateRole.JUMBO);

      if (!valid) {
        throw new BadRequestException(
          'JUMBO vehicles require exactly one JUMBO plate',
        );
      }
    }

    return normalized;
  }

  private async log(
    action: VehicleAuditAction,
    userId: string,
    entityId: string,
    values?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.auditService.log({
      userId,
      action,
      entityType: VEHICLE_ENTITY_TYPE,
      entityId,
      newValues: values,
    });
  }

  private toAuditSnapshot(
    vehicle: VehicleWithRelations,
  ): Prisma.InputJsonObject {
    return {
      id: vehicle.id,
      vehicleCode: vehicle.vehicleCode,
      type: vehicle.type,
      status: vehicle.status,
      currentDriverId: vehicle.currentDriverId,
      assignedDriverId: vehicle.assignedDriverId,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model,
      productionYear: vehicle.productionYear,
      capacityKg: vehicle.capacityKg,
      notes: vehicle.notes,
      plates: vehicle.plates.map((plate) => ({
        role: plate.role,
        plateNumber: plate.plateNumber,
      })),
    };
  }

  async assignDriver(
    id: string,
    driverId: string | null,
    user: AuthenticatedUser,
  ): Promise<VehicleWithRelations> {
    const existing = await this.findOne(id);

    if (driverId) {
      await this.assertDriverExists(driverId);
      await this.assertDriverActive(driverId);
      await this.assertDriverNotAssignedElsewhere(driverId, id);
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: { assignedDriverId: driverId },
      include: VEHICLE_INCLUDE,
    });

    await this.log(VehicleAuditAction.UPDATE, user.id, id, {
      oldValues: this.toAuditSnapshot(existing),
      newValues: this.toAuditSnapshot(updated),
    });

    return updated;
  }

  private async assertDriverExists(driverId: string): Promise<void> {
    const driver = await this.prisma.driver.findFirst({
      where: { id: driverId, deletedAt: null },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
  }

  private async assertDriverActive(driverId: string): Promise<void> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: { status: true },
    });
    if (driver && driver.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Driver status must be ACTIVE to be assigned to a vehicle (current: ${driver.status})`,
      );
    }
  }

  private async assertDriverNotAssignedElsewhere(
    driverId: string,
    excludeVehicleId?: string,
  ): Promise<void> {
    const where: Prisma.VehicleWhereInput = {
      assignedDriverId: driverId,
      deletedAt: null,
    };
    if (excludeVehicleId) {
      where.id = { not: excludeVehicleId };
    }
    const existing = await this.prisma.vehicle.findFirst({ where });
    if (existing) {
      throw new ConflictException(
        `Driver is already assigned to vehicle "${existing.vehicleCode}"`,
      );
    }
  }

  async exportCsv(): Promise<string> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { deletedAt: null },
      include: VEHICLE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    const rows = vehicles.map((v) => ({
      vehicleCode: v.vehicleCode,
      type: v.type,
      status: v.status,
      manufacturer: v.manufacturer ?? '',
      model: v.model ?? '',
      productionYear: v.productionYear?.toString() ?? '',
      capacityKg: v.capacityKg?.toString() ?? '',
      currentDriverId: v.currentDriverId ?? '',
      assignedDriverId: v.assignedDriverId ?? '',
      notes: v.notes ?? '',
      plates: v.plates.map((p) => `${p.role}:${p.plateNumber}`).join('; '),
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
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
      if (target.includes('vehicles_vehicle_code_key')) {
        throw new ConflictException('Vehicle code already exists');
      }
      throw new ConflictException('Vehicle code or plate number already exists');
    }
  }
}
