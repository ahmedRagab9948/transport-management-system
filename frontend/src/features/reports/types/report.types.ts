export interface RevenueAnalytics {
  totalRevenue: number;
  averageRevenue: number;
  totalTrips: number;
  monthlyRevenue: MonthlyRevenue[];
  period: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  trips: number;
}

export interface TripCompletionMetrics {
  total: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  cancellationRate: number;
  statusDistribution: StatusCount[];
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface VehicleUtilization {
  totalVehicles: number;
  utilizedVehicles: number;
  utilizationRate: number;
  topVehicles: EntityTripCount[];
}

export interface DriverUtilization {
  totalDrivers: number;
  utilizedDrivers: number;
  utilizationRate: number;
  topDrivers: EntityTripCount[];
}

export interface EntityTripCount {
  vehicleId?: string;
  driverId?: string;
  _count: number;
}

export interface ContractRevenueAnalytics {
  totalValue: number;
  averageValue: number;
  totalContracts: number;
  byStatus: ContractStatusRevenue[];
}

export interface ContractStatusRevenue {
  status: string;
  count: number;
  totalValue: number;
}

export interface TopClient {
  clientId: string | null;
  clientName: string;
  totalTrips: number;
  totalRevenue: number;
}

export interface MonthlyKpi {
  month: string;
  trips: number;
  completionRate: number;
}

export interface MonthlyKpis {
  monthlyKpis: MonthlyKpi[];
  currentVehicleStatus: StatusCount[];
  currentDriverStatus: StatusCount[];
}

export interface ReportQueryParams {
  from?: string;
  to?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  limit?: number;
  clientId?: string;
}
