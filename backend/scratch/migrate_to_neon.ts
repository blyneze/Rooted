import { PrismaClient } from '@prisma/client';

/**
 * MIGRATION SCRIPT
 * From Local SQLite/Postgres to Production Neon
 */

const NEON_URL = "postgresql://neondb_owner:npg_MyiFP0EL7Qxk@ep-wandering-breeze-am8cuqkq-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Local client (uses .env DATABASE_URL)
const localPrisma = new PrismaClient();

// Production client (overrides datasource)
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_URL,
    },
  },
});

async function migrate() {
  console.log('🚀 Starting Data Migration...');

  // 1. Topics
  console.log('📦 Migrating Topics...');
  const topics = await localPrisma.topic.findMany();
  for (const item of topics) {
    await prodPrisma.topic.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`✅ Migrated ${topics.length} topics.`);

  // 2. Series
  console.log('📦 Migrating Series...');
  const series = await localPrisma.series.findMany();
  for (const item of series) {
    await prodPrisma.series.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`✅ Migrated ${series.length} series.`);

  // 3. Audio Messages
  console.log('📦 Migrating Audio Messages...');
  const audios = await localPrisma.audioMessage.findMany();
  for (const item of audios) {
    await prodPrisma.audioMessage.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`✅ Migrated ${audios.length} audio messages.`);

  // 4. Video Messages
  console.log('📦 Migrating Video Messages...');
  const videos = await localPrisma.videoMessage.findMany();
  for (const item of videos) {
    await prodPrisma.videoMessage.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`✅ Migrated ${videos.length} video messages.`);

  // 5. Books
  console.log('📦 Migrating Books...');
  const books = await localPrisma.book.findMany();
  for (const item of books) {
    await prodPrisma.book.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`✅ Migrated ${books.length} books.`);

  // 6. Message Topics (Junction)
  console.log('📦 Migrating Message Topics (Junction)...');
  const messageTopics = await localPrisma.messageTopic.findMany();
  for (const item of messageTopics) {
    await prodPrisma.messageTopic.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`✅ Migrated ${messageTopics.length} message-topic links.`);

  // 7. Series Messages (Junction)
  console.log('📦 Migrating Series Messages (Junction)...');
  const seriesMessages = await localPrisma.seriesMessage.findMany();
  for (const item of seriesMessages) {
    await prodPrisma.seriesMessage.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`✅ Migrated ${seriesMessages.length} series-message links.`);

  // 8. Featured Sections
  console.log('📦 Migrating Featured Sections...');
  const sections = await localPrisma.featuredSection.findMany();
  for (const item of sections) {
    await prodPrisma.featuredSection.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  const sectionItems = await localPrisma.featuredSectionItem.findMany();
  for (const item of sectionItems) {
    await prodPrisma.featuredSectionItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`✅ Migrated ${sections.length} sections and ${sectionItems.length} items.`);

  console.log('🎉 Data Migration Finished Successfully!');
}

migrate()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  });
