import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { DispatchBoardService } from './dispatch-board.service';

@Controller('dispatch-board')
export class DispatchBoardController {
  constructor(private readonly dispatchBoardService: DispatchBoardService) {}

  @Get('stats')
  @RequirePermissions('VIEW_DISPATCH_BOARD')
  getStats() {
    return this.dispatchBoardService.getStats();
  }

  @Get('trips')
  @RequirePermissions('VIEW_DISPATCH_BOARD')
  getTrips(@Query('includeCancelled') includeCancelled?: string) {
    return this.dispatchBoardService.getTrips(includeCancelled === 'true');
  }

  @Get('trips/:id')
  @RequirePermissions('VIEW_DISPATCH_BOARD')
  getTrip(@Param('id', ParseUUIDPipe) id: string) {
    return this.dispatchBoardService.getTrip(id);
  }

  @Get('resources')
  @RequirePermissions('VIEW_DISPATCH_BOARD')
  getResources() {
    return this.dispatchBoardService.getResources();
  }
}
