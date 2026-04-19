import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unread') unread?: string,
  ) {
    return this.notificationsService.getUserNotifications(
      userId,
      page ? +page : undefined,
      limit ? +limit : undefined,
      unread === 'true',
    );
  }

  @Patch('read')
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Body('notification_ids') notificationIds?: string[],
  ) {
    return this.notificationsService.markAsRead(userId, notificationIds);
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseUUIDPipe) notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.deleteNotification(notificationId, userId);
  }
}
