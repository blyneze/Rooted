import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private expo: any;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Dynamic import to support ESM package in CJS environment
    const { Expo } = await import('expo-server-sdk');
    this.expo = new Expo();
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  }

  async deleteNotification(id: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  async savePushToken(userId: string, token: string) {
    return this.prisma.user.update({
      where: { clerkId: userId },
      data: { pushToken: token },
    });
  }

  /**
   * Send a notification to a specific user (In-App + Push)
   */
  async notifyUser(userId: string, data: { type: string; title: string; body: string; actionRoute?: string; imageUrl?: string }) {
    // 1. Create In-App Notification
    const notif = await this.prisma.notification.create({
      data: {
        userId,
        ...data,
      },
    });

    // 2. Fetch User's Push Token
    const user = await this.prisma.user.findUnique({
      where: { clerkId: userId },
      select: { pushToken: true },
    });

    // 3. Send Push Notification if token exists
    if (user?.pushToken) {
      await this.sendPush(user.pushToken, data.title, data.body, { route: data.actionRoute });
    }

    return notif;
  }

  /**
   * Broadcast a notification to ALL users
   */
  async broadcastNotification(data: { type: string; title: string; body: string; actionRoute?: string; imageUrl?: string }) {
    const users = await this.prisma.user.findMany({ select: { clerkId: true, pushToken: true } });
    
    // Create In-App Notifications for everyone
    await this.prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.clerkId,
        ...data,
      })),
    });

    // Send Push Notifications
    const messages: any[] = [];
    for (const user of users) {
      if (user.pushToken) {
        messages.push({
          to: user.pushToken,
          sound: 'default',
          title: data.title,
          body: data.body,
          data: { route: data.actionRoute },
        });
      }
    }

    // Chunk and send
    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending push chunk:', error);
      }
    }
  }

  private async sendPush(token: string, title: string, body: string, data?: any) {
    const messages: any[] = [{
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }];

    try {
      await this.expo.sendPushNotificationsAsync(messages);
    } catch (e) {
      console.error('Push error:', e);
    }
  }
}
