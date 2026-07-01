import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { PERMISSIONS } from '@tms/shared';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CREATE_USER)
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.create(dto, user);
  }

  @Get('roles')
  @RequirePermissions(PERMISSIONS.VIEW_ROLES)
  getRoles() {
    return this.usersService.getRoles();
  }

  @Get('summary')
  @RequirePermissions(PERMISSIONS.VIEW_USERS)
  getSummary() {
    return this.usersService.getSummary();
  }

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_USERS)
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_USERS)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.UPDATE_USER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.update(id, dto, user);
  }

  @Post(':id/activate')
  @RequirePermissions(PERMISSIONS.UPDATE_USER)
  activate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.activate(id, user);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.DELETE_USER)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.remove(id, user);
  }

  @Post(':id/reset-password')
  @RequirePermissions(PERMISSIONS.UPDATE_USER)
  resetPassword(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.resetPassword(id, user);
  }

  @Post(':id/force-logout')
  @RequirePermissions(PERMISSIONS.UPDATE_USER)
  forceLogout(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.forceLogout(id, user);
  }
}
