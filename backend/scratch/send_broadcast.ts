import { PrismaClient } from '@prisma/client';

/**
 * CLI SCRIPT to broadcast a notification to ALL users.
 * Usage: npx ts-node scratch/send_broadcast.ts "Title" "Body" "/series/xyz"
 */

const NEON_URL = "postgresql://neondb_owner:npg_MyiFP0EL7Qxk@ep-wandering-breeze-am8cuqkq-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient({
  datasources: { db: { url: NEON_URL } },
});

async function broadcast() {
  // Dynamic import for ESM package
  const { Expo } = await import('expo-server-sdk');
  const expo = new Expo();

  const title = process.argv[2] || 'New Series Uploaded! 🎬';
  const body = process.argv[3] || 'Check out our latest series just added to Rooted.';
  const route = process.argv[4] || '/(tabs)';

  console.log(`📣 Broadcasting: "${title}"`);

  const users = await prisma.user.findMany({ select: { clerkId: true, pushToken: true } });
  
  // 1. In-App
  // @ts-ignore - Ignore type errors if Prisma generate hasn't fully propagated to TS-node yet
  await prisma.notification.createMany({
    data: users.map(u => ({
      userId: u.clerkId,
      type: 'series_alert',
      title,
      body,
      actionRoute: route,
    })),
  });

  // 2. Push
  const messages: any[] = [];
  for (const user of users) {
    // @ts-ignore
    if (user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
      messages.push({
        // @ts-ignore
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data: { route },
      });
    }
  }

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error('Error sending push chunk:', error);
    }
  }

  console.log(`✅ Broadcast complete to ${users.length} users.`);
}

broadcast().catch(console.error).finally(() => prisma.$disconnect());
