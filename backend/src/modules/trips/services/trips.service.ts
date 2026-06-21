import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType, Prisma, TripStatus } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { toCsv } from '../../../common/utils/csv';
import {
  NOTIFICATION_EVENTS,
} from '../../notifications/events/notification-events';
import type { NotificationEvent } from '../../notifications/events/notification-events';
import { CreateTripDto } from '../dto/create-trip.dto';
import { QueryTripsDto } from '../dto/query-trips.dto';
import { UpdateTripStatusDto } from '../dto/update-trip-status.dto';
import { UpdateTripDto } from '../dto/update-trip.dto';
import {
  TRIP_ENTITY_TYPE,
  TripAuditAction,
} from '../enums/trip-audit-action.enum';
import { validateTransition } from '../constants/trip-transitions';
import { STATUS_REASON_CODES } from '../constants/status-reason-codes';
import type { AvailabilityWarning } from '../types/availability.types';
import { WARNINGS_PROPERTY } from '../../../common/interfaces/api-response.interface';

const TRIP_INCLUDE = {
  vehicle: {
    select: {
      id: true,
      vehicleCode: true,
      plates: {
        where: { deletedAt: null },
        select: { plateNumber: true, role: true },
      },
    },
  },
  client: {
    select: {
      id: true,
      companyName: true,
    },
  },
  driver: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      driverCode: true,
    },
  },
  contract: {
    select: {
      id: true,
      contractNumber: true,
      contractType: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  statusHistories: {
    orderBy: { changedAt: 'desc' as const },
    take: 10,
    include: {
      changedBy: {
        select: { id: true, fullName: true },
      },
    },
  },
};

type TripWithRelations = Prisma.TripGetPayload<{
  include: typeof TRIP_INCLUDE;
}>;

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    dto: CreateTripDto,
    user: AuthenticatedUser,
  ): Promise<TripWithRelations> {
    const targetStatus = dto.status ?? TripStatus.PENDING;
    const needsResourceLock = targetStatus === TripStatus.ASSIGNED || targetStatus === TripStatus.IN_PROGRESS;

    if (dto.startDate && dto.endDate && new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after or equal to start date');
    }

    const warnings = await this.assertResourcesAvailable(dto.vehicleId, dto.driverId, {
      proposedStartDate: dto.startDate ? new Date(dto.startDate) : undefined,
      proposedEndDate: dto.endDate ? new Date(dto.endDate) : undefined,
      targetStatus,
    });

    try {
      const createData = {
        tripNumber: dto.tripNumber.trim(),
        clientId: dto.clientId || null,
        contractId: dto.contractId || null,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        fromLocation: dto.fromLocation.trim(),
        toLocation: dto.toLocation.trim(),
        status: targetStatus,
        cargoDescription: dto.cargoDescription?.trim(),
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        notes: dto.notes?.trim(),
        createdById: user.id,
        statusHistories: {
          create: {
            oldStatus: null,
            newStatus: targetStatus,
            changedById: user.id,
            reasonCode: STATUS_REASON_CODES.TRIP_CREATED,
            notes: 'Trip created',
          },
        },
      };

      const options = needsResourceLock
        ? { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        : undefined;

      const trip = await this.prisma.$transaction(
        async (tx) => tx.trip.create({ data: createData as any, include: TRIP_INCLUDE }),
        options,
      );

      (trip as any)[WARNINGS_PROPERTY] = warnings;

      await this.log(TripAuditAction.CREATE, user.id, trip.id, {
        tripNumber: trip.tripNumber,
        status: trip.status,
        vehicleId: trip.vehicleId,
        driverId: trip.driverId,
      });

      const event: NotificationEvent = {
        eventName: NOTIFICATION_EVENTS.TRIP_CREATED,
        notificationType: NotificationType.TRIP_CREATED,
        recipients: [user.id],
        payload: {
          entityType: TRIP_ENTITY_TYPE,
          entityId: trip.id,
          title: `Trip ${trip.tripNumber} created`,
          message: `Trip from ${trip.fromLocation} to ${trip.toLocation} has been created with status ${trip.status}`,
          tripNumber: trip.tripNumber,
          newStatus: trip.status,
        },
      };
      this.eventEmitter.emit(event.eventName, event);

      return trip;
    } catch (error) {
      this.handleKnownPrismaError(error);
      throw error;
    }
  }

  async findAll(query: QueryTripsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.trip.findMany({
        where,
        include: TRIP_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where }),
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

  async findOne(id: string): Promise<TripWithRelations> {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
      include: TRIP_INCLUDE,
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async update(
    id: string,
    dto: UpdateTripDto,
    user: AuthenticatedUser,
  ): Promise<TripWithRelations> {
    const existing = await this.findOne(id);

    const TERMINAL_STATUSES: TripStatus[] = [TripStatus.COMPLETED, TripStatus.CANCELLED];
    if (TERMINAL_STATUSES.includes(existing.status)) {
      const blockedFields: Array<keyof UpdateTripDto> = [
        'tripNumber', 'vehicleId', 'driverId', 'status',
        'fromLocation', 'toLocation', 'startDate', 'endDate',
        'actualEndDate',
      ];
      for (const field of blockedFields) {
        if ((dto as any)[field] !== undefined) {
          throw new BadRequestException(
            `Cannot change ${field} on a ${existing.status.toLowerCase()} trip. ` +
            'Only notes and cargo description can be edited.',
          );
        }
      }
    }

    const needsResourceLock = !!(dto.vehicleId || dto.driverId);

    const startDate = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : existing.endDate;
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException('End date must be after or equal to start date');
    }

    const actualEndDate = dto.actualEndDate ? new Date(dto.actualEndDate) : existing.actualEndDate;
    if (startDate && actualEndDate && actualEndDate < startDate) {
      throw new BadRequestException('Actual end date must be after or equal to start date');
    }

    let warnings: AvailabilityWarning[] = [];

    if (dto.vehicleId || dto.driverId) {
      warnings = await this.assertResourcesAvailable(
        dto.vehicleId ?? existing.vehicleId,
        dto.driverId ?? existing.driverId,
        { excludeTripId: id, targetStatus: dto.status },
      );
    }

    try {
      const transaction = async (tx: Prisma.TransactionClient) => {
        const updateData: any = {};

        if (dto.tripNumber !== undefined) updateData.tripNumber = dto.tripNumber.trim();
        if (dto.vehicleId !== undefined) updateData.vehicleId = dto.vehicleId;
        if (dto.driverId !== undefined) updateData.driverId = dto.driverId;
        if (dto.fromLocation !== undefined) updateData.fromLocation = dto.fromLocation.trim();
        if (dto.toLocation !== undefined) updateData.toLocation = dto.toLocation.trim();
        if (dto.cargoDescription !== undefined) updateData.cargoDescription = dto.cargoDescription.trim();
        if (dto.startDate !== undefined) updateData.startDate = dto.startDate ? new Date(dto.startDate) : undefined;
        if (dto.endDate !== undefined) updateData.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
        if (dto.actualEndDate !== undefined) updateData.actualEndDate = dto.actualEndDate ? new Date(dto.actualEndDate) : undefined;
        if (dto.notes !== undefined) updateData.notes = dto.notes.trim();

        await tx.trip.update({
          where: { id },
          data: updateData,
        });

        if (dto.status) {
          validateTransition(existing.status, dto.status);

          if (dto.status === TripStatus.IN_PROGRESS) {
            await tx.trip.update({
              where: { id },
              data: { actualStartDate: new Date() },
            });
          }

          await tx.tripStatusHistory.create({
            data: {
              tripId: id,
              oldStatus: existing.status,
              newStatus: dto.status,
              changedById: user.id,
              reasonCode: STATUS_REASON_CODES.STATUS_EDIT,
              notes: 'Status updated via trip edit',
            },
          });
        }

        return tx.trip.findFirstOrThrow({
          where: { id, deletedAt: null },
          include: TRIP_INCLUDE,
        });
      };

      const options = needsResourceLock
        ? { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        : undefined;

      const updated = await this.prisma.$transaction(transaction, options);

      (updated as any)[WARNINGS_PROPERTY] = warnings;

      await this.log(TripAuditAction.UPDATE, user.id, id, {
        oldValues: this.toAuditSnapshot(existing),
        newValues: this.toAuditSnapshot(updated),
      });

      if (dto.status) {
        const statusEventMap: Record<string, { eventName: string; notificationType: NotificationType }> = {
          [TripStatus.ASSIGNED]: { eventName: NOTIFICATION_EVENTS.TRIP_ASSIGNED, notificationType: NotificationType.TRIP_ASSIGNED },
          [TripStatus.COMPLETED]: { eventName: NOTIFICATION_EVENTS.TRIP_COMPLETED, notificationType: NotificationType.TRIP_COMPLETED },
          [TripStatus.CANCELLED]: { eventName: NOTIFICATION_EVENTS.TRIP_CANCELLED, notificationType: NotificationType.TRIP_CANCELLED },
        };
        const eventConfig = statusEventMap[dto.status] ?? {
          eventName: NOTIFICATION_EVENTS.TRIP_STATUS_CHANGED,
          notificationType: NotificationType.TRIP_STATUS_CHANGED,
        };
        const event: NotificationEvent = {
          eventName: eventConfig.eventName,
          notificationType: eventConfig.notificationType,
          recipients: [user.id],
          payload: {
            entityType: TRIP_ENTITY_TYPE,
            entityId: id,
            title: `Trip ${updated.tripNumber} ${dto.status.toLowerCase().replace(/_/g, ' ')}`,
            message: `Trip ${updated.tripNumber} status changed from ${existing.status.toLowerCase().replace(/_/g, ' ')} to ${dto.status.toLowerCase().replace(/_/g, ' ')}`,
            tripNumber: updated.tripNumber,
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
    dto: UpdateTripStatusDto,
    user: AuthenticatedUser,
  ): Promise<TripWithRelations> {
    const existing = await this.findOne(id);

    validateTransition(existing.status, dto.status);

    const reasonCode = dto.reasonCode ?? this.defaultReasonCode(existing.status, dto.status);
    const claimsResources = dto.status === TripStatus.ASSIGNED || dto.status === TripStatus.IN_PROGRESS;

    let warnings: AvailabilityWarning[] = [];
    if (claimsResources) {
      warnings = await this.assertResourcesAvailable(existing.vehicleId, existing.driverId, {
        excludeTripId: id,
        targetStatus: dto.status,
        proposedStartDate: existing.startDate,
        proposedEndDate: existing.endDate,
      });
    }

    const options = claimsResources
      ? { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      : undefined;

    const updated = await this.prisma.$transaction(async (tx) => {
      const updateData: any = { status: dto.status };

      if (dto.status === TripStatus.IN_PROGRESS) {
        updateData.actualStartDate = new Date();
      }

      await tx.trip.update({
        where: { id },
        data: updateData,
      });

      await tx.tripStatusHistory.create({
        data: {
          tripId: id,
          oldStatus: existing.status,
          newStatus: dto.status,
          changedById: user.id,
          reasonCode,
          notes: dto.notes?.trim(),
        },
      });

      return tx.trip.findFirstOrThrow({
        where: { id, deletedAt: null },
        include: TRIP_INCLUDE,
      });
    }, options);

    (updated as any)[WARNINGS_PROPERTY] = warnings;

    await this.log(TripAuditAction.STATUS_CHANGE, user.id, id, {
      oldStatus: existing.status,
      newStatus: updated.status,
      reasonCode,
      notes: dto.notes,
    });

    const statusEventMap: Record<string, { eventName: string; notificationType: NotificationType }> = {
      [TripStatus.ASSIGNED]: { eventName: NOTIFICATION_EVENTS.TRIP_ASSIGNED, notificationType: NotificationType.TRIP_ASSIGNED },
      [TripStatus.COMPLETED]: { eventName: NOTIFICATION_EVENTS.TRIP_COMPLETED, notificationType: NotificationType.TRIP_COMPLETED },
      [TripStatus.CANCELLED]: { eventName: NOTIFICATION_EVENTS.TRIP_CANCELLED, notificationType: NotificationType.TRIP_CANCELLED },
    };

    const eventConfig = statusEventMap[updated.status] ?? {
      eventName: NOTIFICATION_EVENTS.TRIP_STATUS_CHANGED,
      notificationType: NotificationType.TRIP_STATUS_CHANGED,
    };

    const event: NotificationEvent = {
      eventName: eventConfig.eventName,
      notificationType: eventConfig.notificationType,
      recipients: [user.id],
      payload: {
        entityType: TRIP_ENTITY_TYPE,
        entityId: id,
        title: `Trip ${updated.tripNumber} ${updated.status.toLowerCase().replace(/_/g, ' ')}`,
        message: `Trip ${updated.tripNumber} status changed from ${existing.status.toLowerCase().replace(/_/g, ' ')} to ${updated.status.toLowerCase().replace(/_/g, ' ')}`,
        tripNumber: updated.tripNumber,
        oldStatus: existing.status,
        newStatus: updated.status,
      },
    };
    this.eventEmitter.emit(event.eventName, event);

    return updated;
  }

  async remove(
    id: string,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    if (user.roleName !== 'admin') {
      throw new ForbiddenException('Only admins can delete trips');
    }

    const existing = await this.findOne(id);
    const deletedAt = new Date();

    await this.prisma.trip.update({
      where: { id },
      data: { deletedAt },
    });

    await this.log(TripAuditAction.DELETE, user.id, id, {
      oldValues: this.toAuditSnapshot(existing),
      deletedAt,
    });

    return { message: 'Trip deleted successfully' };
  }

  private async assertResourcesAvailable(
    vehicleId: string,
    driverId: string,
    options?: {
      excludeTripId?: string;
      proposedStartDate?: Date | null;
      proposedEndDate?: Date | null;
      targetStatus?: TripStatus;
    },
  ): Promise<AvailabilityWarning[]> {
    const warnings: AvailabilityWarning[] = [];

    const [vehicle, driver] = await Promise.all([
      this.prisma.vehicle.findFirst({
        where: { id: vehicleId, deletedAt: null },
      }),
      this.prisma.driver.findFirst({
        where: { id: driverId, deletedAt: null },
      }),
    ]);

    if (!vehicle) {
      throw new BadRequestException('Vehicle not found');
    }

    if (vehicle.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Vehicle ${vehicle.vehicleCode} is not available (current status: ${vehicle.status.replace(/_/g, ' ').toLowerCase()})`,
      );
    }

    if (!driver) {
      throw new BadRequestException('Driver not found');
    }

    if (driver.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Driver ${driver.fullName} is not available (current status: ${driver.status.toLowerCase()})`,
      );
    }

    const hardStatuses: TripStatus[] = [TripStatus.ASSIGNED, TripStatus.IN_PROGRESS];
    const softStatuses: TripStatus[] = [TripStatus.PENDING];

    const excludeFilter = options?.excludeTripId
      ? { id: { not: options.excludeTripId } }
      : {};

    const [hardVehicle, hardDriver, softVehicle, softDriver] = await Promise.all([
      this.prisma.trip.findFirst({
        where: {
          vehicleId,
          status: { in: hardStatuses },
          deletedAt: null,
          ...excludeFilter,
        },
        select: { id: true, tripNumber: true, status: true, startDate: true, endDate: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.trip.findFirst({
        where: {
          driverId,
          status: { in: hardStatuses },
          deletedAt: null,
          ...excludeFilter,
        },
        select: { id: true, tripNumber: true, status: true, startDate: true, endDate: true },
        orderBy: { createdAt: 'desc' },
      }),
      options?.targetStatus === TripStatus.ASSIGNED || options?.targetStatus === TripStatus.IN_PROGRESS
        ? this.prisma.trip.findMany({
            where: {
              vehicleId,
              status: { in: softStatuses },
              deletedAt: null,
              ...excludeFilter,
            },
            select: { id: true, tripNumber: true, status: true, startDate: true, endDate: true },
          })
        : Promise.resolve([]),
      options?.targetStatus === TripStatus.ASSIGNED || options?.targetStatus === TripStatus.IN_PROGRESS
        ? this.prisma.trip.findMany({
            where: {
              driverId,
              status: { in: softStatuses },
              deletedAt: null,
              ...excludeFilter,
            },
            select: { id: true, tripNumber: true, status: true, startDate: true, endDate: true },
          })
        : Promise.resolve([]),
    ]);

    if (hardVehicle) {
      throw new ConflictException(
        `Vehicle ${vehicle.vehicleCode} is already on trip ${hardVehicle.tripNumber} (${hardVehicle.status.toLowerCase().replace(/_/g, ' ')})`,
      );
    }

    if (hardDriver) {
      throw new ConflictException(
        `Driver ${driver.fullName} is already on trip ${hardDriver.tripNumber} (${hardDriver.status.toLowerCase().replace(/_/g, ' ')})`,
      );
    }

    const proposedStart = options?.proposedStartDate;
    const proposedEnd = options?.proposedEndDate;

    const isDateOverlap = (aStart: Date | null, aEnd: Date | null, bStart: Date | null, bEnd: Date | null): boolean => {
      if (!aStart || !aEnd || !bStart || !bEnd) return false;
      return aStart < bEnd && aEnd > bStart;
    };

    for (const otherTrip of softVehicle) {
      if (proposedStart && proposedEnd && isDateOverlap(proposedStart, proposedEnd, otherTrip.startDate, otherTrip.endDate)) {
        warnings.push({
          type: 'DATE_OVERLAP',
          severity: 'SOFT',
          message: `Vehicle ${vehicle.vehicleCode} has a pending trip ${otherTrip.tripNumber} with overlapping dates`,
          conflictingTripId: otherTrip.id,
          conflictingTripNumber: otherTrip.tripNumber,
        });
      }
    }

    for (const otherTrip of softDriver) {
      if (proposedStart && proposedEnd && isDateOverlap(proposedStart, proposedEnd, otherTrip.startDate, otherTrip.endDate)) {
        warnings.push({
          type: 'DATE_OVERLAP',
          severity: 'SOFT',
          message: `Driver ${driver.fullName} has a pending trip ${otherTrip.tripNumber} with overlapping dates`,
          conflictingTripId: otherTrip.id,
          conflictingTripNumber: otherTrip.tripNumber,
        });
      }
    }

    return warnings;
  }

  private buildWhere(query: QueryTripsDto): Prisma.TripWhereInput {
    const where: Prisma.TripWhereInput = {
      deletedAt: null,
    };

    if (query.activeOnly) {
      where.status = {
        in: [TripStatus.PENDING, TripStatus.ASSIGNED, TripStatus.IN_PROGRESS],
      };
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (query.driverId) {
      where.driverId = query.driverId;
    }

    if (query.vehicleId) {
      where.vehicleId = query.vehicleId;
    }

    if (query.dateFrom || query.dateTo) {
      const startDateFilter: Prisma.DateTimeFilter = {};
      if (query.dateFrom) {
        startDateFilter.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        startDateFilter.lte = new Date(query.dateTo);
      }
      where.startDate = startDateFilter;
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { tripNumber: { contains: search, mode: 'insensitive' } },
        { fromLocation: { contains: search, mode: 'insensitive' } },
        { toLocation: { contains: search, mode: 'insensitive' } },
        { cargoDescription: { contains: search, mode: 'insensitive' } },
        {
          driver: {
            fullName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          vehicle: {
            vehicleCode: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    return where;
  }

  private async log(
    action: TripAuditAction,
    userId: string,
    entityId: string,
    values?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.auditService.log({
      userId,
      action,
      entityType: TRIP_ENTITY_TYPE,
      entityId,
      newValues: values,
    });
  }

  private toAuditSnapshot(
    trip: TripWithRelations,
  ): Prisma.InputJsonObject {
    return {
      id: trip.id,
      tripNumber: trip.tripNumber,
      status: trip.status,
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      fromLocation: trip.fromLocation,
      toLocation: trip.toLocation,
      cargoDescription: trip.cargoDescription,
      startDate: trip.startDate,
      endDate: trip.endDate,
      actualStartDate: trip.actualStartDate,
      actualEndDate: trip.actualEndDate,
      notes: trip.notes,
    };
  }

  private defaultReasonCode(from: TripStatus, to: TripStatus): string {
    if (to === TripStatus.ASSIGNED) return STATUS_REASON_CODES.DISPATCHER_ASSIGNED;
    if (to === TripStatus.IN_PROGRESS && from === TripStatus.PENDING) return STATUS_REASON_CODES.IMMEDIATE_DISPATCH;
    if (to === TripStatus.IN_PROGRESS) return STATUS_REASON_CODES.TRIP_STARTED;
    if (to === TripStatus.COMPLETED) return STATUS_REASON_CODES.TRIP_COMPLETED;
    if (to === TripStatus.CANCELLED) return STATUS_REASON_CODES.DISPATCHER_CANCELLED;
    return STATUS_REASON_CODES.STATUS_EDIT;
  }

  async exportCsv(): Promise<string> {
    const trips = await this.prisma.trip.findMany({
      where: { deletedAt: null },
      include: TRIP_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    const rows = trips.map((t) => ({
      tripNumber: t.tripNumber,
      status: t.status,
      fromLocation: t.fromLocation,
      toLocation: t.toLocation,
      cargoDescription: t.cargoDescription ?? '',
      startDate: t.startDate?.toISOString() ?? '',
      endDate: t.endDate?.toISOString() ?? '',
      actualStartDate: t.actualStartDate?.toISOString() ?? '',
      actualEndDate: t.actualEndDate?.toISOString() ?? '',
      price: t.price?.toString() ?? '',
      vehicleCode: t.vehicle.vehicleCode,
      driverCode: t.driver.driverCode,
      driverName: t.driver.fullName,
      clientName: t.client?.companyName ?? '',
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return toCsv(rows);
  }

  private handleKnownPrismaError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException('Trip number already exists');
    }
  }
}
