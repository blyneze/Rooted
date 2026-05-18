import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking local database content...');
  try {
    const counts = {
      users: await prisma.user.count(),
      series: await prisma.series.count(),
      audioMessages: await prisma.audioMessage.count(),
      videoMessages: await prisma.videoMessage.count(),
      playbackRecords: await prisma.playbackRecord.count(),
      seriesMessages: await prisma.seriesMessage.count(),
      books: await prisma.book.count(),
      featuredSections: await prisma.featuredSection.count(),
      featuredSectionItems: await prisma.featuredSectionItem.count(),
      topics: await prisma.topic.count(),
      messageTopics: await prisma.messageTopic.count(),
      playlists: await prisma.playlist.count(),
      playlistItems: await prisma.playlistItem.count(),
      savedItems: await prisma.savedItem.count(),
      playbackProgress: await prisma.playbackProgress.count(),
      downloads: await prisma.download.count(),
      userPreferences: await prisma.userPreference.count(),
      bibleNotes: await prisma.bibleNote.count(),
      bibleHighlights: await prisma.bibleHighlight.count(),
      bibleBookmarks: await prisma.bibleBookmark.count(),
      notifications: await prisma.notification.count(),
    };

    console.log('--- Database Record Counts ---');
    console.table(counts);
  } catch (error) {
    console.error('Error connecting to local database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
