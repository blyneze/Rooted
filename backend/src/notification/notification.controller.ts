import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SaveTokenDto } from './dto/save-token.dto';

@Controller('notifications')
@UseGuards(ClerkAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@CurrentUser() userId: string) {
    return this.notificationService.getNotifications(userId);
  }

  @Post('token')
  async saveToken(@CurrentUser() userId: string, @Body() body: SaveTokenDto) {
    return this.notificationService.savePushToken(userId, body.token);
  }

  @Patch(':id/read')
  async markAsRead(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.notificationService.markAsRead(id, userId);
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  async deleteNotification(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.notificationService.deleteNotification(id, userId);
  }
}
