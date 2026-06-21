import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';
import type {
  ContractRevenueAnalytics,
  DriverUtilization,
  MonthlyKpis,
  RevenueAnalytics,
  ReportQueryParams,
  TopClient,
  TripCompletionMetrics,
  VehicleUtilization,
} from '../types/report.types';

export const reportsService = {
  async getRevenue(params: ReportQueryParams = {}): Promise<RevenueAnalytics> {
    const response = await apiClient.get('/reports/revenue', { params });
    return unwrapApiResponse<RevenueAnalytics>(response);
  },

  async getTripCompletion(params: ReportQueryParams = {}): Promise<TripCompletionMetrics> {
    const response = await apiClient.get('/reports/trip-completion', { params });
    return unwrapApiResponse<TripCompletionMetrics>(response);
  },

  async getVehicleUtilization(params: ReportQueryParams = {}): Promise<VehicleUtilization> {
    const response = await apiClient.get('/reports/vehicle-utilization', { params });
    return unwrapApiResponse<VehicleUtilization>(response);
  },

  async getDriverUtilization(params: ReportQueryParams = {}): Promise<DriverUtilization> {
    const response = await apiClient.get('/reports/driver-utilization', { params });
    return unwrapApiResponse<DriverUtilization>(response);
  },

  async getContractRevenue(params: ReportQueryParams = {}): Promise<ContractRevenueAnalytics> {
    const response = await apiClient.get('/reports/contract-revenue', { params });
    return unwrapApiResponse<ContractRevenueAnalytics>(response);
  },

  async getTopClients(params: ReportQueryParams = {}): Promise<TopClient[]> {
    const response = await apiClient.get('/reports/top-clients', { params });
    return unwrapApiResponse<TopClient[]>(response);
  },

  async getMonthlyKpis(params: ReportQueryParams = {}): Promise<MonthlyKpis> {
    const response = await apiClient.get('/reports/monthly-kpis', { params });
    return unwrapApiResponse<MonthlyKpis>(response);
  },
};
