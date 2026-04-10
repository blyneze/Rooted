import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async getHomeFeed() {
    try {
      const featured = await this.prisma.featuredSection.findMany({
        orderBy: { orderIndex: 'asc' },
        include: {
          items: {
            include: {
              audio: { include: { topics: { include: { topic: true } } } },
              video: { include: { topics: { include: { topic: true } } } },
              book: true,
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      const seriesList = await this.prisma.series.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      const trendingMessages = await this.prisma.audioMessage.findMany({
        take: 6,
      });

      const recentMessages = await this.prisma.audioMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
      });

      const books = await this.prisma.book.findMany({
        take: 5,
      });

      return {
        featured: (featured || []).map(section => ({
          ...section,
          items: (section.items || []).map(item => ({
            ...item,
            // Fallback to avoid undefined message in frontend
            message: item.audio || item.video || null, 
          })),
        })),
        series: (seriesList || []).map(s => ({
          ...s,
          name: s.title || 'Untitled Series',
          artworkUrl: s.coverUrl || '',
        })),
        trending: trendingMessages || [],
        recent: recentMessages || [],
        books: books || [],
      };
    } catch (error) {
      console.error('[ContentService] getHomeFeed error:', error);
      return { featured: [], series: [], trending: [], recent: [], books: [] };
    }
  }

  async getMessages(query?: string) {
    return this.prisma.audioMessage.findMany({
      where: query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { speakerName: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        topics: { include: { topic: true } },
      },
      orderBy: { releaseDate: 'desc' },
    });
  }

  async getMessageById(id: string) {
    const message = await this.prisma.audioMessage.findUnique({
      where: { id },
      include: {
        seriesItems: { include: { series: true } },
        topics: { include: { topic: true } },
      },
    });

    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async getSeries() {
    return this.prisma.series.findMany({
      orderBy: { title: 'asc' },
    });
  }

  async getSeriesById(id: string) {
    const series = await this.prisma.series.findUnique({
      where: { id },
      include: {
        messages: {
          include: { audio: true, video: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!series) throw new NotFoundException('Series not found');
    
    return {
      ...series,
      name: series.title,
      artworkUrl: series.coverUrl,
      messages: (series.messages || [])
        .map((sm) => sm.audio || sm.video)
        .filter(Boolean),
    };
  }

  async getBooks() {
    return this.prisma.book.findMany({
      orderBy: { title: 'asc' },
    });
  }

  async getBookById(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }
}
