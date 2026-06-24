import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AssignmentReason, Prisma, VehicleStatus } from '@prisma/client';
import { AuditService } from '../../../common/services/audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ACTIVE_TRIP_STATUSES } from '../../trips/constants/trip-statuses';
import { SECTOR_ERRORS } from '../constants/sector-errors';
import { SECTOR_PERMISSIONS } from '../constants/sector-permissions';
import { AssignVehicleDto } from '../dto/assign-vehicle.dto';
import { TransferVehicleDto } from '../dto/transfer-vehicle.dto';
import { UnassignVehicleDto } from '../dto/unassign-vehicle.dto';

const VEHICLE_ASSIGNMENT_ENTITY = 'VehicleAssignment';

@Injectable()
export class VehicleAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async assign(vehicleId: string, dto: AssignVehicleDto, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException(SECTOR_ERRORS.VEHICLE_NOT_FOUND);
    if (vehicle.status === VehicleStatus.IN_MAINTENANCE) throw new BadRequestException(SECTOR_ERRORS.VEHICLE_IN_MAINTENANCE);
    if (vehicle.status === VehicleStatus.OUT_OF_SERVICE) throw new BadRequestException(SECTOR_ERRORS.VEHICLE_OUT_OF_SERVICE);

    const existingAssignment = await this.prisma.vehicleAssignment.findFirst({
      where: { vehicleId, unassignedAt: null },
    });
    if (existingAssignment) throw new ConflictException(SECTOR_ERRORS.VEHICLE_ALREADY_ASSIGNED);

    const subSector = await this.prisma.subSector.findUnique({ where: { id: dto.subSectorId } });
    if (!subSector) throw new NotFoundException(SECTOR_ERRORS.SUB_SECTOR_NOT_FOUND);
    if (subSector.status !== 'ACTIVE') throw new BadRequestException(SECTOR_ERRORS.SUB_SECTOR_INACTIVE);

    const assignment = await this.prisma.vehicleAssignment.create({
      data: {
        vehicleId,
        subSectorId: dto.subSectorId,
        notes: dto.notes,
      },
      include: { vehicle: true, subSector: { include: { sector: true } } },
    });

    await this.prisma.vehicleAssignmentHistory.create({
      data: {
        vehicleId,
        subSectorId: dto.subSectorId,
        assignedAt: assignment.assignedAt,
        reason: AssignmentReason.ASSIGNMENT,
        notes: dto.notes,
        changedById: userId,
      },
    });

    await this.auditService.log({
      userId,
      action: 'VEHICLE_ASSIGNED',
      entityType: VEHICLE_ASSIGNMENT_ENTITY,
      entityId: assignment.id,
      newValues: { vehicleId, subSectorId: dto.subSectorId },
    });

    return assignment;
  }

  async transfer(vehicleId: string, dto: TransferVehicleDto, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException(SECTOR_ERRORS.VEHICLE_NOT_FOUND);

    const currentAssignment = await this.prisma.vehicleAssignment.findFirst({
      where: { vehicleId, unassignedAt: null },
      include: { subSector: true },
    });
    if (!currentAssignment) throw new BadRequestException(SECTOR_ERRORS.NO_ACTIVE_ASSIGNMENT);

    const hasActiveTrip = await this.prisma.trip.findFirst({
      where: { vehicleId, status: { in: ACTIVE_TRIP_STATUSES as any }, deletedAt: null },
    });
    if (hasActiveTrip) throw new BadRequestException(SECTOR_ERRORS.VEHICLE_HAS_ACTIVE_TRIP);

    const targetSubSector = await this.prisma.subSector.findUnique({ where: { id: dto.targetSubSectorId } });
    if (!targetSubSector) throw new NotFoundException(SECTOR_ERRORS.SUB_SECTOR_NOT_FOUND);
    if (targetSubSector.status !== 'ACTIVE') throw new BadRequestException(SECTOR_ERRORS.SUB_SECTOR_INACTIVE);
    if (targetSubSector.id === currentAssignment.subSectorId) throw new BadRequestException(SECTOR_ERRORS.SAME_SUB_SECTOR);

    const now = new Date();

    const [newAssignment] = await this.prisma.$transaction(async (tx) => {
      await tx.vehicleAssignment.update({
        where: { id: currentAssignment.id },
        data: { unassignedAt: now },
      });

      const fresh = await tx.vehicleAssignment.create({
        data: {
          vehicleId,
          subSectorId: dto.targetSubSectorId,
          assignedAt: now,
        },
        include: { vehicle: true, subSector: { include: { sector: true } } },
      });

      await tx.vehicleAssignmentHistory.create({
        data: {
          vehicleId,
          subSectorId: dto.targetSubSectorId,
          assignedAt: now,
          unassignedAt: now,
          reason: AssignmentReason.TRANSFER,
          transferredFromSubSectorId: currentAssignment.subSectorId,
          changedById: userId,
        },
      });

      await this.auditService.log({
        userId,
        action: 'VEHICLE_TRANSFERRED',
        entityType: VEHICLE_ASSIGNMENT_ENTITY,
        entityId: fresh.id,
        oldValues: { subSectorId: currentAssignment.subSectorId },
        newValues: { subSectorId: dto.targetSubSectorId },
      });

      return [fresh];
    });

    return newAssignment;
  }

  async unassign(vehicleId: string, dto: UnassignVehicleDto, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException(SECTOR_ERRORS.VEHICLE_NOT_FOUND);

    const currentAssignment = await this.prisma.vehicleAssignment.findFirst({
      where: { vehicleId, unassignedAt: null },
      include: { subSector: true },
    });
    if (!currentAssignment) throw new BadRequestException(SECTOR_ERRORS.NO_ACTIVE_ASSIGNMENT);

    const hasActiveTrip = await this.prisma.trip.findFirst({
      where: { vehicleId, status: { in: ACTIVE_TRIP_STATUSES as any }, deletedAt: null },
    });
    if (hasActiveTrip) throw new BadRequestException(SECTOR_ERRORS.VEHICLE_HAS_ACTIVE_TRIP);

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.vehicleAssignment.update({
        where: { id: currentAssignment.id },
        data: { unassignedAt: now },
      });

      await tx.vehicleAssignmentHistory.create({
        data: {
          vehicleId,
          subSectorId: currentAssignment.subSectorId,
          assignedAt: currentAssignment.assignedAt,
          unassignedAt: now,
          reason: AssignmentReason.UNASSIGNMENT,
          notes: dto.notes,
          changedById: userId,
        },
      });

      await this.auditService.log({
        userId,
        action: 'VEHICLE_UNASSIGNED',
        entityType: VEHICLE_ASSIGNMENT_ENTITY,
        entityId: currentAssignment.id,
        oldValues: { subSectorId: currentAssignment.subSectorId },
      });
    });
  }
}
