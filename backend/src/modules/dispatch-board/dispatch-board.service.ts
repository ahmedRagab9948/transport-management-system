import { Injectable, NotFoundException } from '@nestjs/common';
import { TripStatus } from '@prisma/client';
import { TRIP_STATUS } from '@tms/shared';
import { PrismaService } from '../../prisma/prisma.service';

const TRIP_INCLUDE = {
  vehicle: {
    select: { id: true, vehicleCode: true, plates: { where: { deletedAt: null }, select: { plateNumber: true, role: true } } },
  },
  client: { select: { id: true, companyName: true } },
  contract: { select: { id: true, contractNumber: true, contractType: true } },
  driver: { select: { id: true, fullName: true, phone: true, driverCode: true } },
  createdBy: { select: { id: true, fullName: true, email: true } },
};

@Injectable()
export class DispatchBoardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const allStatuses = Object.values(TRIP_STATUS) as TripStatus[];

    const counts = await Promise.all(
      allStatuses.map((status) =>
        this.prisma.trip.count({ where: { status, deletedAt: null } }),
      ),
    );

    const statusCounts: Record<string, number> = {};
    allStatuses.forEach((status, i) => {
      statusCounts[status.toLowerCase()] = counts[i];
    });

    const waitingOver30 = await this.prisma.trip.count({
      where: {
        status: TRIP_STATUS.WAITING,
        deletedAt: null,
        waitingStartedAt: { lte: new Date(Date.now() - 30 * 60 * 1000) },
      },
    });

    const waitingOver60 = await this.prisma.trip.count({
      where: {
        status: TRIP_STATUS.WAITING,
        deletedAt: null,
        waitingStartedAt: { lte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    const [availableVehicles, availableDrivers] = await Promise.all([
      this.prisma.vehicle.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      this.prisma.driver.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
    ]);

    return {
      ...statusCounts,
      waitingOver30min: waitingOver30,
      waitingOver60min: waitingOver60,
      availableVehicles,
      availableDrivers,
    };
  }

  async getTrips(includeCancelled = false) {
    const excludeStatuses: TripStatus[] = includeCancelled ? [] : [TRIP_STATUS.CANCELLED];

    const trips = await this.prisma.trip.findMany({
      where: {
        deletedAt: null,
        ...(excludeStatuses.length > 0 ? { status: { notIn: excludeStatuses } } : {}),
      },
      include: TRIP_INCLUDE,
      orderBy: { createdAt: 'asc' },
      take: 500,
    });

    const group = (statuses: TripStatus[]) =>
      trips
        .filter((t) => statuses.includes(t.status))
        .map((t) => ({
          ...t,
          ageMinutes: Math.floor((Date.now() - t.createdAt.getTime()) / 60000),
        }));

    return {
      groups: {
        draft: { statuses: [TRIP_STATUS.DRAFT] as TripStatus[], trips: group([TRIP_STATUS.DRAFT]) },
        pending: { statuses: [TRIP_STATUS.PENDING] as TripStatus[], trips: group([TRIP_STATUS.PENDING]) },
        assigning: { statuses: [TRIP_STATUS.ASSIGNED, TRIP_STATUS.DRIVER_CONFIRMED] as TripStatus[], trips: group([TRIP_STATUS.ASSIGNED, TRIP_STATUS.DRIVER_CONFIRMED]) },
        loading: { statuses: [TRIP_STATUS.LOADING] as TripStatus[], trips: group([TRIP_STATUS.LOADING]) },
        on_route: { statuses: [TRIP_STATUS.ON_ROUTE] as TripStatus[], trips: group([TRIP_STATUS.ON_ROUTE]) },
        arrival: { statuses: [TRIP_STATUS.WAITING, TRIP_STATUS.UNLOADING] as TripStatus[], trips: group([TRIP_STATUS.WAITING, TRIP_STATUS.UNLOADING]) },
        completed: { statuses: [TRIP_STATUS.COMPLETED] as TripStatus[], trips: group([TRIP_STATUS.COMPLETED]) },
        ...(includeCancelled ? { cancelled: { statuses: [TRIP_STATUS.CANCELLED] as TripStatus[], trips: group([TRIP_STATUS.CANCELLED]) } } : {}),
      },
    };
  }

  async getTrip(id: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...TRIP_INCLUDE,
        statusHistories: {
          orderBy: { changedAt: 'desc' },
          take: 20,
          include: { changedBy: { select: { id: true, fullName: true } } },
        },
      },
    });

    if (!trip) throw new NotFoundException('Trip not found');

    return {
      ...trip,
      ageMinutes: Math.floor((Date.now() - trip.createdAt.getTime()) / 60000),
    };
  }

  async getResources() {
    const [vehicles, drivers] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        select: {
          id: true,
          vehicleCode: true,
          type: true,
          status: true,
          assignedDriver: { select: { id: true, fullName: true } },
        },
        orderBy: { vehicleCode: 'asc' },
      }),
      this.prisma.driver.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        select: {
          id: true,
          fullName: true,
          phone: true,
          driverCode: true,
          status: true,
          currentVehicleId: true,
        },
        orderBy: { fullName: 'asc' },
      }),
    ]);

    const activeStatuses: TripStatus[] = [TRIP_STATUS.ASSIGNED, TRIP_STATUS.DRIVER_CONFIRMED, TRIP_STATUS.LOADING, TRIP_STATUS.ON_ROUTE, TRIP_STATUS.WAITING, TRIP_STATUS.UNLOADING];

    const vehicleIds = vehicles.map((v) => v.id);
    const driverIds = drivers.map((d) => d.id);

    const [claimedVehicleIds, claimedDriverIds] = await Promise.all([
      this.prisma.trip.findMany({
        where: { vehicleId: { in: vehicleIds }, status: { in: activeStatuses }, deletedAt: null },
        select: { vehicleId: true },
        distinct: ['vehicleId'],
      }),
      this.prisma.trip.findMany({
        where: { driverId: { in: driverIds }, status: { in: activeStatuses }, deletedAt: null },
        select: { driverId: true },
        distinct: ['driverId'],
      }),
    ]);

    const claimedVehicleSet = new Set(claimedVehicleIds.map((v) => v.vehicleId));
    const claimedDriverSet = new Set(claimedDriverIds.map((d) => d.driverId));

    return {
      vehicles: vehicles.map((v) => ({
        ...v,
        isAvailable: !claimedVehicleSet.has(v.id),
      })),
      drivers: drivers.map((d) => ({
        ...d,
        isAvailable: !claimedDriverSet.has(d.id),
      })),
    };
  }
}
