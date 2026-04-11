import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing VideoMessage table...');
  // Delete all video messages and their related records
  await prisma.videoMessage.deleteMany();
  console.log('✅ VideoMessage table cleared safely.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
