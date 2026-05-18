import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('notifications')
@UseGuards(ClerkAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Req() req: any) {
    return this.notificationService.getNotifications(req.user.clerkId);
  }

  @Post('token')
  async saveToken(@Req() req: any, @Body('token') token: string) {
    return this.notificationService.savePushToken(req.user.clerkId, token);
  }

  @Patch(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationService.markAsRead(id, req.user.clerkId);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user.clerkId);
  }

  @Delete(':id')
  async deleteNotification(@Req() req: any, @Param('id') id: string) {
    return this.notificationService.deleteNotification(id, req.user.clerkId);
  }
}
