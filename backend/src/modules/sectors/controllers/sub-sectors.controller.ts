import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { PERMISSIONS } from '@tms/shared';
import { CreateSubSectorDto } from '../dto/create-sub-sector.dto';
import { SectorStatusDto } from '../dto/sector-status.dto';
import { UpdateSubSectorDto } from '../dto/update-sub-sector.dto';
import { SubSectorsService } from '../services/sub-sectors.service';

@Controller()
export class SubSectorsController {
  constructor(private readonly subSectorsService: SubSectorsService) {}

  @Post('sectors/:sectorId/sub-sectors')
  @RequirePermissions(PERMISSIONS.MANAGE_SUB_SECTORS)
  create(
    @Param('sectorId', ParseUUIDPipe) sectorId: string,
    @Body() dto: CreateSubSectorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.subSectorsService.create(sectorId, dto, user.id);
  }

  @Get('sectors/:sectorId/sub-sectors')
  @RequirePermissions(PERMISSIONS.VIEW_SECTORS)
  findAll(@Param('sectorId', ParseUUIDPipe) sectorId: string) {
    return this.subSectorsService.findAll(sectorId);
  }

  @Get('sub-sectors/:id')
  @RequirePermissions(PERMISSIONS.VIEW_SECTORS)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subSectorsService.findOne(id);
  }

  @Patch('sub-sectors/:id')
  @RequirePermissions(PERMISSIONS.MANAGE_SUB_SECTORS)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubSectorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.subSectorsService.update(id, dto, user.id);
  }

  @Patch('sub-sectors/:id/status')
  @RequirePermissions(PERMISSIONS.MANAGE_SUB_SECTORS)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SectorStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.subSectorsService.updateStatus(id, dto, user.id);
  }
}
