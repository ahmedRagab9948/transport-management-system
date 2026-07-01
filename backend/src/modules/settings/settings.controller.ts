import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { PERMISSIONS } from '@tms/shared';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import type { Request } from 'express';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_SETTINGS)
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch()
  @RequirePermissions(PERMISSIONS.UPDATE_SETTINGS)
  update(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.update(dto, user, {
      ipAddress: req.ip ?? '',
      userAgent: req.headers['user-agent'] ?? '',
    });
  }
}
