import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStatus, VehicleStatus, DriverStatus, ContractStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [totalTrips, activeTrips, availableVehicles, activeDrivers, activeContracts, activeClients] =
      await Promise.all([
        this.prisma.trip.count({ where: { deletedAt: null } }),
        this.prisma.trip.count({
          where: {
            deletedAt: null,
            status: { in: [TripStatus.PENDING, TripStatus.ASSIGNED, TripStatus.DRIVER_CONFIRMED, TripStatus.LOADING, TripStatus.ON_ROUTE, TripStatus.WAITING, TripStatus.UNLOADING] },
          },
        }),
        this.prisma.vehicle.count({
          where: { deletedAt: null, status: VehicleStatus.ACTIVE },
        }),
        this.prisma.driver.count({
          where: { deletedAt: null, status: DriverStatus.ACTIVE },
        }),
        this.prisma.contract.count({
          where: { deletedAt: null, status: ContractStatus.ACTIVE },
        }),
        this.prisma.client.count({
          where: { deletedAt: null, status: 'ACTIVE' },
        }),
      ]);

    return {
      totalTrips,
      activeTrips,
      availableVehicles,
      activeDrivers,
      activeContracts,
      activeClients,
      expiringContracts: await this.prisma.contract.count({
        where: {
          deletedAt: null,
          status: ContractStatus.ACTIVE,
          endDate: { lte: thirtyDaysFromNow, gte: currentDate },
        },
      }),
    };
  }

  async getTripsStatusDistribution() {
    const groups = await this.prisma.trip.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
    });

    return groups.map((g) => ({ status: g.status, count: g._count.id }));
  }

  async getMonthlyTrips() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trips = await this.prisma.trip.findMany({
      where: { deletedAt: null, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthMap: Record<string, number> = {};
    for (const trip of trips) {
      const key = `${trip.createdAt.getFullYear()}-${String(trip.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] ?? 0) + 1;
    }

    const months: Array<{ month: string; count: number }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en', { month: 'short', year: 'numeric' });
      months.push({ month: label, count: monthMap[key] ?? 0 });
    }

    return months;
  }

  async getVehicleStatusDistribution() {
    const groups = await this.prisma.vehicle.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
    });

    return groups.map((g) => ({ status: g.status, count: g._count.id }));
  }

  async getDriverStatusDistribution() {
    const groups = await this.prisma.driver.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
    });

    return groups.map((g) => ({ status: g.status, count: g._count.id }));
  }

  async getRecentActivity() {
    const [recentTrips, recentContracts, recentVehicleChanges] = await Promise.all([
      this.prisma.trip.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          tripNumber: true,
          status: true,
          createdAt: true,
          fromLocation: true,
          toLocation: true,
        },
      }),
      this.prisma.contract.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          contractNumber: true,
          title: true,
          status: true,
          updatedAt: true,
          client: { select: { companyName: true } },
        },
      }),
      this.prisma.vehicleStatusHistory.findMany({
        orderBy: { changedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          oldStatus: true,
          newStatus: true,
          changedAt: true,
          notes: true,
          vehicle: { select: { vehicleCode: true } },
          changedBy: { select: { fullName: true } },
        },
      }),
    ]);

    return {
      recentTrips,
      recentContracts,
      recentVehicleChanges,
    };
  }

  async getSystemAlerts() {
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [expiringContracts, vehiclesInMaintenance, suspendedDrivers, inactiveDrivers] =
      await Promise.all([
        this.prisma.contract.findMany({
          where: {
            deletedAt: null,
            status: ContractStatus.ACTIVE,
            endDate: { lte: thirtyDaysFromNow, gte: currentDate },
          },
          orderBy: { endDate: 'asc' },
          take: 5,
          select: {
            id: true,
            contractNumber: true,
            title: true,
            endDate: true,
            client: { select: { companyName: true } },
          },
        }),
        this.prisma.vehicle.findMany({
          where: { deletedAt: null, status: VehicleStatus.IN_MAINTENANCE },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: { id: true, vehicleCode: true, notes: true },
        }),
        this.prisma.driver.findMany({
          where: { deletedAt: null, status: DriverStatus.SUSPENDED },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: { id: true, fullName: true },
        }),
        this.prisma.driver.findMany({
          where: { deletedAt: null, status: DriverStatus.INACTIVE },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: { id: true, fullName: true },
        }),
      ]);

    return {
      expiringContracts,
      vehiclesInMaintenance,
      suspendedDrivers,
      inactiveDrivers,
    };
  }
}
