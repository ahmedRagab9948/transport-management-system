export { DashboardPage } from './components/dashboard-page';
export { useDashboardSummary, useTripsStatus, useMonthlyTrips, useVehicleUtilization, useDriverStatusDistribution, useRecentActivity, useSystemAlerts } from './hooks/use-dashboard';
export { dashboardService } from './services/dashboard.service';
export type { DashboardSummary, StatusCount, MonthlyTripCount, RecentActivity, SystemAlerts } from './types/dashboard.types';
