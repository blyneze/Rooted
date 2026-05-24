import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  console.log(`Found ${count} user(s). Deleting...`);

  // Cascading deletes handle all related records automatically
  const result = await prisma.user.deleteMany({});
  console.log(`✅ Deleted ${result.count} user(s) successfully.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
