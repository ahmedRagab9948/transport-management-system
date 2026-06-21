import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { NotificationsService } from './notifications.service';
import { MarkReadDto, QueryNotificationsDto } from './dto/notifications.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions('VIEW_NOTIFICATIONS')
  findAll(@Req() req: any, @Query() query: QueryNotificationsDto) {
    return this.notificationsService.findAll(req.user.id, query);
  }

  @Get('unread-count')
  @RequirePermissions('VIEW_NOTIFICATIONS')
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch('mark-read')
  @RequirePermissions('VIEW_NOTIFICATIONS')
  markAsRead(@Req() req: any, @Body() dto: MarkReadDto) {
    return this.notificationsService.markAsRead(req.user.id, dto);
  }

  @Post('mark-all-read')
  @RequirePermissions('VIEW_NOTIFICATIONS')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
