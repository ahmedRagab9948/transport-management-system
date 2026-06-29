import { Controller, Get } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { DashboardService } from './dashboard.service';
import { PERMISSIONS } from '@tms/shared';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('trips-status')
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  getTripsStatus() {
    return this.dashboardService.getTripsStatusDistribution();
  }

  @Get('monthly-trips')
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  getMonthlyTrips() {
    return this.dashboardService.getMonthlyTrips();
  }

  @Get('vehicle-utilization')
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  getVehicleUtilization() {
    return this.dashboardService.getVehicleStatusDistribution();
  }

  @Get('driver-status-distribution')
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  getDriverStatusDistribution() {
    return this.dashboardService.getDriverStatusDistribution();
  }

  @Get('recent-activity')
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }

  @Get('system-alerts')
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  getSystemAlerts() {
    return this.dashboardService.getSystemAlerts();
  }
}
