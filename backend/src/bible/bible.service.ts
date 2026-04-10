import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BibleService {
  private readonly logger = new Logger(BibleService.name);
  private readonly defaultBibleId = process.env.API_BIBLE_ID || 'de4e12af7f28f599-01'; 

  constructor(private prisma: PrismaService) {}

  async getBooks() {
    // 66 books are purely static, so returning the static array is optimal
    return this.getMockBooks();
  }

  async getChapter(bookId: string, chapterId: string) {
    try {
      const query = `${bookId}+${chapterId}`;
      const url = `https://bible-api.com/${query}`;
      const response = await axios.get(url);
      const data = response.data;

      const verses = data.verses.map((v: any) => ({
        reference: `${bookId}-${v.chapter}-${v.verse}`,
        bookId: bookId,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.trim(),
        displayReference: v.verse === 1 ? data.reference : `${data.reference}:${v.verse}`,
      }));

      return {
        id: `${bookId}.${chapterId}`,
        bookId,
        reference: data.reference,
        verses,
      };
    } catch (error) {
      const err = error as any;
      const errorData = {
        message: err.message,
        stack: err.stack,
        url: err.config?.url,
        status: err.response?.status,
        data: err.response?.data
      };
      require('fs').writeFileSync('bible-error.json', JSON.stringify(errorData, null, 2));
      this.logger.error(`Failed to fetch chapter ${bookId} ${chapterId} - ${err.message}`);
      throw new InternalServerErrorException(`Bible API Error: ${err.message}`);
    }
  }

  // --- Study Data Persistence ---
  async getNotes(clerkId: string) {
    return this.prisma.bibleNote.findMany({ where: { userId: clerkId }, orderBy: { updatedAt: 'desc' } });
  }

  async createNote(clerkId: string, book: string, chapter: number, verse: number | null, content: string) {
    return this.prisma.bibleNote.create({
      data: { userId: clerkId, book, chapter, verse, content }
    });
  }

  async deleteNote(clerkId: string, id: string) {
    return this.prisma.bibleNote.deleteMany({ where: { id, userId: clerkId } });
  }

  async getHighlights(clerkId: string) {
    return this.prisma.bibleHighlight.findMany({ where: { userId: clerkId }, orderBy: { createdAt: 'desc' } });
  }

  async createHighlight(clerkId: string, book: string, chapter: number, verse: number, colorHex: string) {
    return this.prisma.bibleHighlight.upsert({
      where: { userId_book_chapter_verse: { userId: clerkId, book, chapter, verse } },
      update: { colorHex },
      create: { userId: clerkId, book, chapter, verse, colorHex }
    });
  }
  
  async deleteHighlight(clerkId: string, id: string) {
    return this.prisma.bibleHighlight.deleteMany({ where: { id, userId: clerkId } });
  }

  // Fallbacks for testing frontend without valid api keys
  private getMockBooks() {
    return [
      { id: 'GEN', name: 'Genesis' },
      { id: 'EXO', name: 'Exodus' },
      { id: 'JHN', name: 'John' },
      { id: 'ROM', name: 'Romans' }
    ];
  }

  private getMockChapter(bookId: string, chapterId: string) {
    return {
      id: `${bookId}.${chapterId}`,
      bookId,
      reference: `${bookId} ${chapterId}`,
      content: [
         { type: 'tag', name: 'p', items: [
            { type: 'text', text: 'For God so loved the world, that he gave his only Son...' }
         ]}
      ]
    };
  }
}
