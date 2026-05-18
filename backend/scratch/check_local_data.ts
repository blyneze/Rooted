import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking local data counts...');
  
  const counts = {
    users: await prisma.user.count(),
    audioMessages: await prisma.audioMessage.count(),
    videoMessages: await prisma.videoMessage.count(),
    books: await prisma.book.count(),
    series: await prisma.series.count(),
    playlists: await prisma.playlist.count(),
    bibleNotes: await prisma.bibleNote.count(),
    bibleBookmarks: await prisma.bibleBookmark.count(),
    bibleHighlights: await prisma.bibleHighlight.count(),
  };

  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
