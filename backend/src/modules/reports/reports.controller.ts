import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { ReportsService } from './reports.service';
import { PERMISSIONS } from '@tms/shared';
import type {
  DateRangeDto,
  ReportQueryDto,
  TopClientsQueryDto,
} from './dto/report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @RequirePermissions(PERMISSIONS.VIEW_REPORTS)
  getRevenue(@Query() query: ReportQueryDto) {
    return this.reportsService.getRevenueAnalytics(query);
  }

  @Get('trip-completion')
  @RequirePermissions(PERMISSIONS.VIEW_REPORTS)
  getTripCompletion(@Query() query: DateRangeDto) {
    return this.reportsService.getTripCompletionMetrics(query);
  }

  @Get('vehicle-utilization')
  @RequirePermissions(PERMISSIONS.VIEW_REPORTS)
  getVehicleUtilization(@Query() query: DateRangeDto) {
    return this.reportsService.getVehicleUtilization(query);
  }

  @Get('driver-utilization')
  @RequirePermissions(PERMISSIONS.VIEW_REPORTS)
  getDriverUtilization(@Query() query: DateRangeDto) {
    return this.reportsService.getDriverUtilization(query);
  }

  @Get('contract-revenue')
  @RequirePermissions(PERMISSIONS.VIEW_REPORTS)
  getContractRevenue(@Query() query: DateRangeDto) {
    return this.reportsService.getContractRevenueAnalytics(query);
  }

  @Get('top-clients')
  @RequirePermissions(PERMISSIONS.VIEW_REPORTS)
  getTopClients(@Query() query: TopClientsQueryDto) {
    return this.reportsService.getTopClients(query);
  }

  @Get('monthly-kpis')
  @RequirePermissions(PERMISSIONS.VIEW_REPORTS)
  getMonthlyKpis(@Query() query: DateRangeDto) {
    return this.reportsService.getMonthlyKpis(query);
  }
}
