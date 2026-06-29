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
import { CreateContractDto } from '../dto/create-contract.dto';
import { QueryContractsDto } from '../dto/query-contracts.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { UpdateContractStatusDto } from '../dto/update-contract-status.dto';
import { ContractsService } from '../services/contracts.service';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CREATE_CONTRACT)
  create(
    @Body() dto: CreateContractDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contractsService.create(dto, user);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @RequirePermissions(PERMISSIONS.VIEW_CONTRACTS)
  exportCsv() {
    return this.contractsService.exportCsv();
  }

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_CONTRACTS)
  findAll(@Query() query: QueryContractsDto) {
    return this.contractsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_CONTRACTS)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.UPDATE_CONTRACT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContractDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contractsService.update(id, dto, user);
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.UPDATE_CONTRACT)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContractStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contractsService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.DELETE_CONTRACT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contractsService.remove(id, user);
  }
}
