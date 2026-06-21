import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { ReportsService } from './reports.service';
import type {
  DateRangeDto,
  ReportQueryDto,
  TopClientsQueryDto,
} from './dto/report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @RequirePermissions('VIEW_REPORTS')
  getRevenue(@Query() query: ReportQueryDto) {
    return this.reportsService.getRevenueAnalytics(query);
  }

  @Get('trip-completion')
  @RequirePermissions('VIEW_REPORTS')
  getTripCompletion(@Query() query: DateRangeDto) {
    return this.reportsService.getTripCompletionMetrics(query);
  }

  @Get('vehicle-utilization')
  @RequirePermissions('VIEW_REPORTS')
  getVehicleUtilization(@Query() query: DateRangeDto) {
    return this.reportsService.getVehicleUtilization(query);
  }

  @Get('driver-utilization')
  @RequirePermissions('VIEW_REPORTS')
  getDriverUtilization(@Query() query: DateRangeDto) {
    return this.reportsService.getDriverUtilization(query);
  }

  @Get('contract-revenue')
  @RequirePermissions('VIEW_REPORTS')
  getContractRevenue(@Query() query: DateRangeDto) {
    return this.reportsService.getContractRevenueAnalytics(query);
  }

  @Get('top-clients')
  @RequirePermissions('VIEW_REPORTS')
  getTopClients(@Query() query: TopClientsQueryDto) {
    return this.reportsService.getTopClients(query);
  }

  @Get('monthly-kpis')
  @RequirePermissions('VIEW_REPORTS')
  getMonthlyKpis(@Query() query: DateRangeDto) {
    return this.reportsService.getMonthlyKpis(query);
  }
}
