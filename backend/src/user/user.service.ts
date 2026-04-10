import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Automatically ensure a user record exists in our DB when they make an authenticated request
  async ensureUserSync(clerkId: string, email?: string, firstName?: string, lastName?: string) {
    let user = await this.prisma.user.findUnique({
      where: { clerkId },
    });
    
    if (!user) {
      user = await this.prisma.user.create({
        data: { clerkId, email, firstName, lastName },
      });
      // create default preferences
      await this.prisma.userPreference.create({
        data: { userId: clerkId },
      });
    } else if (email && user.email !== email) {
       // Optional: update user details if changed in Clerk
       await this.prisma.user.update({
          where: { clerkId },
          data: { email, firstName, lastName }
       });
    }
    
    return user;
  }

  async getSavedItems(clerkId: string) {
    return this.prisma.savedItem.findMany({
      where: { userId: clerkId },
      include: {
        audio: true,
        video: true,
        book: true,
      },
      orderBy: { savedAt: 'desc' },
    });
  }

  async saveItem(clerkId: string, payload: { audioId?: string; videoId?: string; bookId?: string; messageId?: string }) {
    const audioId = payload.audioId || (payload.messageId ? payload.messageId : undefined);
    const videoId = payload.videoId;
    const bookId = payload.bookId;

    if (!audioId && !videoId && !bookId) {
       throw new Error('Must provide a valid ID to save');
    }
    
    // Check if it already exists
    const existing = await this.prisma.savedItem.findFirst({
        where: {
            userId: clerkId,
            audioId: audioId || null,
            videoId: videoId || null,
            bookId: bookId || null,
        }
    });

    if (existing) return existing;

    return this.prisma.savedItem.create({
      data: {
        userId: clerkId,
        audioId,
        videoId,
        bookId,
      },
    });
  }

  async removeSavedItem(clerkId: string, id: string) {
    return this.prisma.savedItem.deleteMany({
      where: {
         id,
         userId: clerkId,
       },
    });
  }

  async getPlaylists(clerkId: string) {
    return this.prisma.playlist.findMany({
      where: { userId: clerkId },
      include: {
        items: {
          include: { audio: true, video: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPlaylist(clerkId: string, name: string, description?: string) {
    return this.prisma.playlist.create({
      data: {
        userId: clerkId,
        name,
        description,
      },
    });
  }

  async addPlaylistItem(clerkId: string, playlistId: string, payload: { audioId?: string; videoId?: string; messageId?: string }) {
    const audioId = payload.audioId || payload.messageId;
    const videoId = payload.videoId;

    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist || playlist.userId !== clerkId) throw new NotFoundException('Playlist not found');

    const count = await this.prisma.playlistItem.count({ where: { playlistId } });

    return this.prisma.playlistItem.create({
      data: {
        playlistId,
        audioId,
        videoId,
        orderIndex: count + 1,
      },
    });
  }

  async deletePlaylist(clerkId: string, playlistId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist || playlist.userId !== clerkId) throw new NotFoundException('Playlist not found');

    return this.prisma.playlist.delete({
      where: { id: playlistId },
    });
  }

  async removePlaylistItem(clerkId: string, playlistId: string, payload: { audioId?: string; videoId?: string; messageId?: string }) {
    const audioId = payload.audioId || payload.messageId;
    const videoId = payload.videoId;

    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist || playlist.userId !== clerkId) throw new NotFoundException('Playlist not found');

    if (audioId) {
      return this.prisma.playlistItem.delete({
        where: {
          playlistId_audioId: { playlistId, audioId },
        },
      });
    } else if (videoId) {
      return this.prisma.playlistItem.delete({
        where: {
          playlistId_videoId: { playlistId, videoId },
        },
      });
    }
    
    throw new Error('Must provide audioId or videoId');
  }

  async getPlaybackProgress(clerkId: string) {
    return this.prisma.playbackProgress.findMany({
      where: { userId: clerkId },
      include: { audio: true, video: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
  }

  async updatePlaybackProgress(clerkId: string, payload: { audioId?: string; videoId?: string; messageId?: string }, position: number, progress: number, isCompleted: boolean) {
    const audioId = payload.audioId || payload.messageId;
    const videoId = payload.videoId;

    if (audioId) {
      return this.prisma.playbackProgress.upsert({
        where: {
          userId_audioId: { userId: clerkId, audioId },
        },
        update: { position, progress, isCompleted },
        create: {
          userId: clerkId,
          audioId,
          position,
          progress,
          isCompleted,
        },
      });
    } else if (videoId) {
      return this.prisma.playbackProgress.upsert({
        where: {
          userId_videoId: { userId: clerkId, videoId },
        },
        update: { position, progress, isCompleted },
        create: {
          userId: clerkId,
          videoId,
          position,
          progress,
          isCompleted,
        },
      });
    }

    throw new Error('Must provide audioId or videoId');
  }
}
