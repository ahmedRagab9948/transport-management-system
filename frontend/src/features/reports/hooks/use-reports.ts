import { QUERY_KEYS } from '@tms/shared';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import type { ReportQueryParams } from '../types/report.types';

export const reportsQueryKeys = {
  all: [QUERY_KEYS.REPORTS] as const,
  revenue: (params: ReportQueryParams) => [QUERY_KEYS.REPORTS, 'revenue', params] as const,
  tripCompletion: (params: ReportQueryParams) => [QUERY_KEYS.REPORTS, 'trip-completion', params] as const,
  vehicleUtilization: (params: ReportQueryParams) => [QUERY_KEYS.REPORTS, 'vehicle-utilization', params] as const,
  driverUtilization: (params: ReportQueryParams) => [QUERY_KEYS.REPORTS, 'driver-utilization', params] as const,
  contractRevenue: (params: ReportQueryParams) => [QUERY_KEYS.REPORTS, 'contract-revenue', params] as const,
  topClients: (params: ReportQueryParams) => [QUERY_KEYS.REPORTS, 'top-clients', params] as const,
  monthlyKpis: (params: ReportQueryParams) => [QUERY_KEYS.REPORTS, 'monthly-kpis', params] as const,
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
