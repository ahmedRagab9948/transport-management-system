import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { PERMISSIONS } from '@tms/shared';
import { AssignVehicleDto } from '../dto/assign-vehicle.dto';
import { TransferVehicleDto } from '../dto/transfer-vehicle.dto';
import { UnassignVehicleDto } from '../dto/unassign-vehicle.dto';
import { VehicleAssignmentsService } from '../services/vehicle-assignments.service';

@Controller('vehicles')
export class VehicleAssignmentsController {
  constructor(private readonly vehicleAssignmentsService: VehicleAssignmentsService) {}

  @Get(':vehicleId/assignment')
  @RequirePermissions(PERMISSIONS.VIEW_VEHICLE_ASSIGNMENTS)
  getAssignment(@Param('vehicleId', ParseUUIDPipe) vehicleId: string) {
    return this.vehicleAssignmentsService.getAssignment(vehicleId);
  }

  @Post(':vehicleId/assign')
  @RequirePermissions(PERMISSIONS.ASSIGN_VEHICLE)
  assign(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() dto: AssignVehicleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehicleAssignmentsService.assign(vehicleId, dto, user.id);
  }

  @Patch(':vehicleId/transfer')
  @RequirePermissions(PERMISSIONS.TRANSFER_VEHICLE)
  transfer(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() dto: TransferVehicleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehicleAssignmentsService.transfer(vehicleId, dto, user.id);
  }

  @Post(':vehicleId/unassign')
  @RequirePermissions(PERMISSIONS.UNASSIGN_VEHICLE)
  unassign(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() dto: UnassignVehicleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehicleAssignmentsService.unassign(vehicleId, dto, user.id);
  }
}
