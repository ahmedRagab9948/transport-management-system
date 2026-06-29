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
import { CreateTripDto } from '../dto/create-trip.dto';
import { QueryTripsDto } from '../dto/query-trips.dto';
import { UpdateTripStatusDto } from '../dto/update-trip-status.dto';
import { UpdateTripDto } from '../dto/update-trip.dto';
import { TripsService } from '../services/trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CREATE_TRIP)
  create(
    @Body() dto: CreateTripDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tripsService.create(dto, user);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @RequirePermissions(PERMISSIONS.VIEW_TRIPS)
  exportCsv() {
    return this.tripsService.exportCsv();
  }

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_TRIPS)
  findAll(@Query() query: QueryTripsDto) {
    return this.tripsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_TRIPS)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.UPDATE_TRIP)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tripsService.update(id, dto, user);
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.UPDATE_TRIP)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tripsService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.DELETE_TRIP)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tripsService.remove(id, user);
  }
}
