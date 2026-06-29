import { QUERY_KEYS } from '@tms/shared';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

const DASHBOARD_ROOT = [QUERY_KEYS.DASHBOARD] as const;

export const dashboardQueryKeys = {
  all: DASHBOARD_ROOT,
  summary: [...DASHBOARD_ROOT, 'summary'] as const,
  tripsStatus: [...DASHBOARD_ROOT, 'trips-status'] as const,
  monthlyTrips: [...DASHBOARD_ROOT, 'monthly-trips'] as const,
  vehicleUtilization: [...DASHBOARD_ROOT, 'vehicle-utilization'] as const,
  driverStatus: [...DASHBOARD_ROOT, 'driver-status'] as const,
  recentActivity: [...DASHBOARD_ROOT, 'recent-activity'] as const,
  systemAlerts: [...DASHBOARD_ROOT, 'system-alerts'] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardQueryKeys.summary,
    queryFn: () => dashboardService.getSummary(),
    refetchInterval: 60_000,
  });
}

export function useTripsStatus() {
  return useQuery({
    queryKey: dashboardQueryKeys.tripsStatus,
    queryFn: () => dashboardService.getTripsStatus(),
    refetchInterval: 60_000,
  });
}

export function useMonthlyTrips() {
  return useQuery({
    queryKey: dashboardQueryKeys.monthlyTrips,
    queryFn: () => dashboardService.getMonthlyTrips(),
    refetchInterval: 60_000,
  });
}

export function useVehicleUtilization() {
  return useQuery({
    queryKey: dashboardQueryKeys.vehicleUtilization,
    queryFn: () => dashboardService.getVehicleUtilization(),
    refetchInterval: 60_000,
  });
}

export function useDriverStatusDistribution() {
  return useQuery({
    queryKey: dashboardQueryKeys.driverStatus,
    queryFn: () => dashboardService.getDriverStatusDistribution(),
    refetchInterval: 60_000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardQueryKeys.recentActivity,
    queryFn: () => dashboardService.getRecentActivity(),
    refetchInterval: 60_000,
  });
}

export function useSystemAlerts() {
  return useQuery({
    queryKey: dashboardQueryKeys.systemAlerts,
    queryFn: () => dashboardService.getSystemAlerts(),
    refetchInterval: 60_000,
  });
}
