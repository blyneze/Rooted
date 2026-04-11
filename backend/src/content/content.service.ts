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

      const videos = await this.prisma.videoMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
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
        videos: videos || [],
        books: books || [],
      };
    } catch (error) {
      console.error('[ContentService] getHomeFeed error:', error);
      return { featured: [], series: [], trending: [], recent: [], books: [] };
    }
  }

  async getMessages(query?: string) {
    const audio = await this.prisma.audioMessage.findMany({
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

    const video = await this.prisma.videoMessage.findMany({
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

    return {
      audio,
      video,
    };
  }

  async getMessageById(id: string) {
    // Try audio first
    const audioMessage = await this.prisma.audioMessage.findUnique({
      where: { id },
      include: {
        seriesItems: { include: { series: true } },
        topics: { include: { topic: true } },
      },
    });

    if (audioMessage) return { ...audioMessage, type: 'audio' };

    // Try video if audio not found
    const videoMessage = await this.prisma.videoMessage.findUnique({
      where: { id },
      include: {
        seriesItems: { include: { series: true } },
        topics: { include: { topic: true } },
      },
    });

    if (videoMessage) return { ...videoMessage, type: 'video' };

    throw new NotFoundException('Message not found');
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
    
    const messages = (series.messages || [])
      .map((sm) => {
        const item = sm.audio || sm.video;
        if (!item) return null;
        // Polyfill coverUrl for video messages using YouTube thumbnail
        const coverUrl = (item as any).coverUrl
          || ((item as any).youtubeId
            ? `https://img.youtube.com/vi/${(item as any).youtubeId}/hqdefault.jpg`
            : '');
        return { ...item, coverUrl };
      })
      .filter(Boolean);

    return {
      ...series,
      name: series.title,
      artworkUrl: series.coverUrl,
      messageCount: messages.length,
      messages,
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
