import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';

import type {
  DashboardSummary,
  MonthlyTripCount,
  RecentActivity,
  StatusCount,
  SystemAlerts,
} from '../types/dashboard.types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get('/dashboard/summary');
    return unwrapApiResponse<DashboardSummary>(response);
  },

  async getTripsStatus(): Promise<StatusCount[]> {
    const response = await apiClient.get('/dashboard/trips-status');
    return unwrapApiResponse<StatusCount[]>(response);
  },

  async getMonthlyTrips(): Promise<MonthlyTripCount[]> {
    const response = await apiClient.get('/dashboard/monthly-trips');
    return unwrapApiResponse<MonthlyTripCount[]>(response);
  },

  async getVehicleUtilization(): Promise<StatusCount[]> {
    const response = await apiClient.get('/dashboard/vehicle-utilization');
    return unwrapApiResponse<StatusCount[]>(response);
  },

  async getDriverStatusDistribution(): Promise<StatusCount[]> {
    const response = await apiClient.get('/dashboard/driver-status-distribution');
    return unwrapApiResponse<StatusCount[]>(response);
  },

  async getRecentActivity(): Promise<RecentActivity> {
    const response = await apiClient.get('/dashboard/recent-activity');
    return unwrapApiResponse<RecentActivity>(response);
  },

  async getSystemAlerts(): Promise<SystemAlerts> {
    const response = await apiClient.get('/dashboard/system-alerts');
    return unwrapApiResponse<SystemAlerts>(response);
  },
};
