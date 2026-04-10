const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve('NO_URL');
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', (e) => {
      resolve('ERROR: ' + e.message);
    });
  });
}

async function main() {
  const books = await prisma.book.findMany();
  for (const book of books) {
    const status = await checkUrl(book.coverUrl);
    console.log(`Book "${book.title}": URL=${book.coverUrl} STATUS=${status}`);
  }
}

main().finally(() => prisma.$disconnect());
