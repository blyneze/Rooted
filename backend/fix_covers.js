const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany();
  for (const book of books) {
    if (book.coverUrl.includes('pub-242a9d59d17a42ac9b65cdbbb323e42b.r2.dev')) {
      const newCoverUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'; // fallback book cover
      await prisma.book.update({
        where: { id: book.id },
        data: { coverUrl: newCoverUrl }
      });
      console.log(`Updated book ${book.id} cover`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
