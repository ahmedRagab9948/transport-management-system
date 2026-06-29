import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { PERMISSIONS } from '@tms/shared';
import { CreateDriverDto } from '../dto/create-driver.dto';
import { QueryDriversDto } from '../dto/query-drivers.dto';
import { UpdateDriverStatusDto } from '../dto/update-driver-status.dto';
import { UpdateDriverDto } from '../dto/update-driver.dto';
import { DriversService } from '../services/drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CREATE_DRIVER)
  create(
    @Body() dto: CreateDriverDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.driversService.create(dto, user);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @RequirePermissions(PERMISSIONS.VIEW_DRIVERS)
  exportCsv() {
    return this.driversService.exportCsv();
  }

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_DRIVERS)
  findAll(@Query() query: QueryDriversDto) {
    return this.driversService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_DRIVERS)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.UPDATE_DRIVER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.driversService.update(id, dto, user);
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.CHANGE_DRIVER_STATUS)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.driversService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.DELETE_DRIVER)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.driversService.remove(id, user);
  }
}
