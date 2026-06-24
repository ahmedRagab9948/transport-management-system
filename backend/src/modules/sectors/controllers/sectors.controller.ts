import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { CreateSectorDto } from '../dto/create-sector.dto';
import { QuerySectorsDto } from '../dto/query-sectors.dto';
import { SectorStatusDto } from '../dto/sector-status.dto';
import { UpdateSectorDto } from '../dto/update-sector.dto';
import { SectorsService } from '../services/sectors.service';

@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Post()
  @RequirePermissions('CREATE_SECTOR')
  create(@Body() dto: CreateSectorDto, @CurrentUser() user: AuthenticatedUser) {
    return this.sectorsService.create(dto, user.id);
  }

  @Get()
  @RequirePermissions('VIEW_SECTORS')
  findAll(@Query() query: QuerySectorsDto) {
    return this.sectorsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('VIEW_SECTORS')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sectorsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('UPDATE_SECTOR')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sectorsService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  @RequirePermissions('DELETE_SECTOR')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SectorStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sectorsService.updateStatus(id, dto, user.id);
  }
}
