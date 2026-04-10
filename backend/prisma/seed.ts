import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Clean existing data (optional, but ensures a fresh start)
  // await prisma.seriesMessage.deleteMany();
  // await prisma.featuredSectionItem.deleteMany();
  // await prisma.featuredSection.deleteMany();
  // await prisma.messageTopic.deleteMany();
  // await prisma.audioMessage.deleteMany();
  // await prisma.videoMessage.deleteMany();
  // await prisma.book.deleteMany();
  // await prisma.topic.deleteMany();
  // await prisma.series.deleteMany();

  // 2. Create Topics
  const topicFaith = await prisma.topic.upsert({
    where: { name: 'Faith' },
    update: {},
    create: { name: 'Faith' },
  });

  const topicPrayer = await prisma.topic.upsert({
    where: { name: 'Prayer' },
    update: {},
    create: { name: 'Prayer' },
  });

  const topicGrowth = await prisma.topic.upsert({
    where: { name: 'Growth' },
    update: {},
    create: { name: 'Growth' },
  });

  const topics = [topicFaith, topicPrayer, topicGrowth];

  // 3. Create 30 Audio Messages
  const audioMessages = [];
  for (let i = 1; i <= 30; i++) {
    const audio = await prisma.audioMessage.create({
      data: {
        title: `Audio Sermon ${i}: The Power of ${['Faith', 'Prayer', 'Word', 'Grace'][i % 4]}`,
        duration: 2400 + (i * 120), // 40+ mins
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        coverUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=800`,
        speakerName: 'Pst Japheth Joseph',
        releaseDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Released in past i days
        topics: {
          create: [
            { topicId: topics[i % topics.length].id }
          ]
        }
      }
    });
    audioMessages.push(audio);
  }

  // 4. Create 30 Video Messages
  const videoMessages = [];
  for (let i = 1; i <= 30; i++) {
    const video = await prisma.videoMessage.create({
      data: {
        title: `Video Teaching ${i}: Life in the Spirit`,
        description: 'A deep dive into spiritual growth and maturity.',
        duration: 3600 + (i * 60),
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        coverUrl: `https://images.unsplash.com/photo-${1600000000000 + i}?auto=format&fit=crop&q=80&w=800`,
        speakerName: 'Pst Japheth Joseph',
        releaseDate: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)),
        topics: {
          create: [
            { topicId: topics[(i + 1) % topics.length].id }
          ]
        }
      }
    });
    videoMessages.push(video);
  }

  // 5. Create 3 Books
  const books = [];
  for (let i = 1; i <= 3; i++) {
    const book = await prisma.book.create({
      data: {
        title: `Spiritual Growth Vol. ${i}`,
        author: 'Pst Japheth Joseph',
        description: 'Essential reading for every believer seeking to grow deeper in their walk with God.',
        coverUrl: `https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800`,
        epubUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Using a dummy PDF/link
        audioUrl: i === 1 ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' : null,
      }
    });
    books.push(book);
  }

  // 6. Create 1 Series
  const series = await prisma.series.create({
    data: {
      title: 'Foundations of Faith',
      description: 'The complete guide to understanding the core pillars of our Christian walk.',
      coverUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800',
      messages: {
        create: [
          { audioId: audioMessages[0].id, orderIndex: 1 },
          { audioId: audioMessages[1].id, orderIndex: 2 },
          { videoId: videoMessages[0].id, orderIndex: 3 },
        ]
      }
    }
  });

  // 7. Setup Featured Sections for UI
  const sectionHero = await prisma.featuredSection.create({
    data: {
      title: 'Featured Messages',
      orderIndex: 0,
      items: {
        create: [
          { audioId: audioMessages[0].id, orderIndex: 0 },
          { videoId: videoMessages[0].id, orderIndex: 1 },
        ]
      }
    }
  });

  const sectionRails = await prisma.featuredSection.create({
    data: {
      title: 'Trending Teachings',
      orderIndex: 1,
      items: {
        create: [
          { audioId: audioMessages[2].id, orderIndex: 0 },
          { audioId: audioMessages[3].id, orderIndex: 1 },
          { bookId: books[0].id, orderIndex: 2 },
        ]
      }
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`- Created ${audioMessages.length} Audio Messages`);
  console.log(`- Created ${videoMessages.length} Video Messages`);
  console.log(`- Created ${books.length} Books`);
  console.log(`- Created 1 Series: ${series.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
