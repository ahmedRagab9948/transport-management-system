import { Injectable } from '@nestjs/common';
import { Prisma, TripStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  DateRangeDto,
  ReportQueryDto,
  TopClientsQueryDto,
} from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueAnalytics(query: ReportQueryDto) {
    const where = this.buildTripWhere(query);
    const period = query.period ?? 'monthly';

    const aggregation = await this.prisma.trip.aggregate({
      where,
      _sum: { price: true },
      _avg: { price: true },
      _count: true,
    });

    const monthlyRevenue = await this.getMonthlyRevenue(where);

    return {
      totalRevenue: aggregation._sum.price ?? 0,
      averageRevenue: aggregation._avg.price ?? 0,
      totalTrips: aggregation._count,
      monthlyRevenue,
      period,
    };
  }

  async getTripCompletionMetrics(query: DateRangeDto) {
    const where = this.buildTripWhere(query);

    const statusCounts = await this.prisma.trip.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const total = statusCounts.reduce((sum, s) => sum + s._count, 0);
    const completed =
      statusCounts.find((s) => s.status === TripStatus.COMPLETED)?._count ?? 0;
    const cancelled =
      statusCounts.find((s) => s.status === TripStatus.CANCELLED)?._count ?? 0;

    return {
      total,
      completed,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      statusDistribution: statusCounts.map((s) => ({
        status: s.status,
        count: s._count,
      })),
    };
  }

  async getVehicleUtilization(query: DateRangeDto) {
    const where = this.buildTripWhere(query);

    const vehicleTrips = await this.prisma.trip.groupBy({
      by: ['vehicleId'],
      where,
      _count: true,
      orderBy: { _count: { id: 'desc' } },
    });

    const totalVehicles = await this.prisma.vehicle.count({
      where: { deletedAt: null },
    });

    const utilizedVehicleIds = new Set(vehicleTrips.map((v) => v.vehicleId));

    return {
      totalVehicles,
      utilizedVehicles: utilizedVehicleIds.size,
      utilizationRate:
        totalVehicles > 0
          ? Math.round((utilizedVehicleIds.size / totalVehicles) * 100)
          : 0,
      topVehicles: vehicleTrips.slice(0, 10),
    };
  }

  async getDriverUtilization(query: DateRangeDto) {
    const where = this.buildTripWhere(query);

    const driverTrips = await this.prisma.trip.groupBy({
      by: ['driverId'],
      where,
      _count: true,
      orderBy: { _count: { id: 'desc' } },
    });

    const totalDrivers = await this.prisma.driver.count({
      where: { deletedAt: null },
    });

    const utilizedDriverIds = new Set(driverTrips.map((d) => d.driverId));

    return {
      totalDrivers,
      utilizedDrivers: utilizedDriverIds.size,
      utilizationRate:
        totalDrivers > 0
          ? Math.round((utilizedDriverIds.size / totalDrivers) * 100)
          : 0,
      topDrivers: driverTrips.slice(0, 10),
    };
  }

  async getContractRevenueAnalytics(query: DateRangeDto) {
    const where = this.buildContractWhere(query);

    const aggregation = await this.prisma.contract.aggregate({
      where,
      _sum: { price: true },
      _avg: { price: true },
      _count: true,
    });

    const statusCounts = await this.prisma.contract.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: { price: true },
    });

    return {
      totalValue: aggregation._sum.price ?? 0,
      averageValue: aggregation._avg.price ?? 0,
      totalContracts: aggregation._count,
      byStatus: statusCounts.map((s) => ({
        status: s.status,
        count: s._count,
        totalValue: s._sum.price ?? 0,
      })),
    };
  }

  async getTopClients(query: TopClientsQueryDto) {
    const limit = query.limit ?? 10;
    const where = this.buildTripWhere(query);

    const clientTripAgg = await this.prisma.trip.groupBy({
      by: ['clientId'],
      where: {
        ...where,
        clientId: { not: null },
      },
      _count: true,
      _sum: { price: true },
      orderBy: { _sum: { price: 'desc' } },
      take: limit,
    });

    const clientIds = clientTripAgg
      .map((c) => c.clientId)
      .filter(Boolean) as string[];

    const clients = clientIds.length > 0
      ? await this.prisma.client.findMany({
          where: { id: { in: clientIds }, deletedAt: null },
          select: { id: true, companyName: true },
        })
      : [];

    const clientMap = new Map(clients.map((c) => [c.id, c.companyName]));

    return clientTripAgg.map((c) => ({
      clientId: c.clientId,
      clientName: c.clientId ? clientMap.get(c.clientId) ?? 'Unknown' : 'Unknown',
      totalTrips: c._count,
      totalRevenue: c._sum.price ?? 0,
    }));
  }

  async getMonthlyKpis(query: DateRangeDto) {
    const where = this.buildTripWhere(query);

    const monthlyTrips = await this.getMonthlyRevenue(where);

    const vehicleStatus = await this.prisma.vehicle.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    });

    const driverStatus = await this.prisma.driver.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    });

    const kpis = await Promise.all(
      monthlyTrips.map(async (month) => {
        const startOfMonth = new Date(month.month + '-01');
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const monthWhere: Prisma.TripWhereInput = {
          ...where,
          createdAt: { gte: startOfMonth, lt: endOfMonth },
        };

        const statusCounts = await this.prisma.trip.groupBy({
          by: ['status'],
          where: monthWhere,
          _count: true,
        });

        const total = statusCounts.reduce((s, c) => s + c._count, 0);
        const completed =
          statusCounts.find((s) => s.status === TripStatus.COMPLETED)?._count ?? 0;

        return {
          month: month.month,
          trips: month.trips,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      }),
    );

    return {
      monthlyKpis: kpis,
      currentVehicleStatus: vehicleStatus.map((v) => ({
        status: v.status,
        count: v._count,
      })),
      currentDriverStatus: driverStatus.map((d) => ({
        status: d.status,
        count: d._count,
      })),
    };
  }

  private async getMonthlyRevenue(where: Prisma.TripWhereInput) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 12);

    const trips = await this.prisma.trip.findMany({
      where: { ...where, createdAt: { gte: cutoff } },
      select: { price: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthMap = new Map<string, { revenue: number; count: number }>();

    for (const trip of trips) {
      const key = trip.createdAt.toISOString().slice(0, 7);
      const entry = monthMap.get(key) ?? { revenue: 0, count: 0 };
      entry.revenue += Number(trip.price ?? 0);
      entry.count += 1;
      monthMap.set(key, entry);
    }

    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      trips: data.count,
    }));
  }

  private buildDateFilter(from?: string, to?: string): { gte?: Date; lte?: Date } {
    const filter: { gte?: Date; lte?: Date } = {};
    if (from) filter.gte = new Date(from);
    if (to) filter.lte = new Date(to);
    return Object.keys(filter).length > 0 ? filter : {};
  }

  private buildTripWhere(query: DateRangeDto): Prisma.TripWhereInput {
    const where: Prisma.TripWhereInput = { deletedAt: null };
    const dateFilter = this.buildDateFilter(query.from, query.to);
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }
    return where;
  }

  private buildContractWhere(query: DateRangeDto): Prisma.ContractWhereInput {
    const where: Prisma.ContractWhereInput = { deletedAt: null };
    const dateFilter = this.buildDateFilter(query.from, query.to);
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }
    return where;
  }
}
