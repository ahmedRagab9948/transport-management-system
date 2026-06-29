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
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { QueryVehiclesDto } from '../dto/query-vehicles.dto';
import { UpdateVehicleStatusDto } from '../dto/update-vehicle-status.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehiclesService } from '../services/vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CREATE_VEHICLE)
  create(
    @Body() dto: CreateVehicleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehiclesService.create(dto, user);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @RequirePermissions(PERMISSIONS.VIEW_VEHICLES)
  exportCsv() {
    return this.vehiclesService.exportCsv();
  }

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_VEHICLES)
  findAll(@Query() query: QueryVehiclesDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_VEHICLES)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.UPDATE_VEHICLE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehiclesService.update(id, dto, user);
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.CHANGE_VEHICLE_STATUS)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehiclesService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.DELETE_VEHICLE)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehiclesService.remove(id, user);
  }
}
