import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import type { ReportQueryParams } from '../types/report.types';

export const reportsQueryKeys = {
  all: ['reports'] as const,
  revenue: (params: ReportQueryParams) => ['reports', 'revenue', params] as const,
  tripCompletion: (params: ReportQueryParams) => ['reports', 'trip-completion', params] as const,
  vehicleUtilization: (params: ReportQueryParams) => ['reports', 'vehicle-utilization', params] as const,
  driverUtilization: (params: ReportQueryParams) => ['reports', 'driver-utilization', params] as const,
  contractRevenue: (params: ReportQueryParams) => ['reports', 'contract-revenue', params] as const,
  topClients: (params: ReportQueryParams) => ['reports', 'top-clients', params] as const,
  monthlyKpis: (params: ReportQueryParams) => ['reports', 'monthly-kpis', params] as const,
};

export function useRevenueAnalytics(params: ReportQueryParams = {}) {
  return useQuery({
    queryKey: reportsQueryKeys.revenue(params),
    queryFn: () => reportsService.getRevenue(params),
  });
}

export function useTripCompletion(params: ReportQueryParams = {}) {
  return useQuery({
    queryKey: reportsQueryKeys.tripCompletion(params),
    queryFn: () => reportsService.getTripCompletion(params),
  });
}

export function useVehicleUtilization(params: ReportQueryParams = {}) {
  return useQuery({
    queryKey: reportsQueryKeys.vehicleUtilization(params),
    queryFn: () => reportsService.getVehicleUtilization(params),
  });
}

export function useDriverUtilization(params: ReportQueryParams = {}) {
  return useQuery({
    queryKey: reportsQueryKeys.driverUtilization(params),
    queryFn: () => reportsService.getDriverUtilization(params),
  });
}

export function useContractRevenue(params: ReportQueryParams = {}) {
  return useQuery({
    queryKey: reportsQueryKeys.contractRevenue(params),
    queryFn: () => reportsService.getContractRevenue(params),
  });
}

export function useTopClients(params: ReportQueryParams = {}) {
  return useQuery({
    queryKey: reportsQueryKeys.topClients(params),
    queryFn: () => reportsService.getTopClients(params),
  });
}

export function useMonthlyKpis(params: ReportQueryParams = {}) {
  return useQuery({
    queryKey: reportsQueryKeys.monthlyKpis(params),
    queryFn: () => reportsService.getMonthlyKpis(params),
  });
}
