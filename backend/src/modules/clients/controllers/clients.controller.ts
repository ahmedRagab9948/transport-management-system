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
import { CreateClientDto } from '../dto/create-client.dto';
import { QueryClientsDto } from '../dto/query-clients.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { UpdateClientStatusDto } from '../dto/update-client-status.dto';
import { ClientsService } from '../services/clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CREATE_CLIENT)
  create(
    @Body() dto: CreateClientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clientsService.create(dto, user);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  exportCsv() {
    return this.clientsService.exportCsv();
  }

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  findAll(@Query() query: QueryClientsDto) {
    return this.clientsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.UPDATE_CLIENT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clientsService.update(id, dto, user);
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.UPDATE_CLIENT)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clientsService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.DELETE_CLIENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clientsService.remove(id, user);
  }
}
