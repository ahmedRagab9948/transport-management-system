import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('trips-status')
  getTripsStatus() {
    return this.dashboardService.getTripsStatusDistribution();
  }

  @Get('monthly-trips')
  getMonthlyTrips() {
    return this.dashboardService.getMonthlyTrips();
  }

  @Get('vehicle-utilization')
  getVehicleUtilization() {
    return this.dashboardService.getVehicleStatusDistribution();
  }

  @Get('driver-status-distribution')
  getDriverStatusDistribution() {
    return this.dashboardService.getDriverStatusDistribution();
  }

  @Get('recent-activity')
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }

  @Get('system-alerts')
  getSystemAlerts() {
    return this.dashboardService.getSystemAlerts();
  }
}
