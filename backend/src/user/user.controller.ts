import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('me')
@UseGuards(ClerkAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sync')
  async syncUser(@CurrentUser() userId: string, @Body() body: any) {
     return this.userService.ensureUserSync(userId, body.email, body.firstName, body.lastName);
  }

  @Get('saved')
  async getSavedItems(@CurrentUser() userId: string) {
    return this.userService.getSavedItems(userId);
  }

  @Post('saved')
  async saveItem(@CurrentUser() userId: string, @Body() body: { messageId?: string; bookId?: string }) {
    return this.userService.saveItem(userId, body);
  }

  @Delete('saved/:id')
  async removeSavedItem(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.userService.removeSavedItem(userId, id);
  }

  @Get('playlists')
  async getPlaylists(@CurrentUser() userId: string) {
    return this.userService.getPlaylists(userId);
  }

  @Post('playlists')
  async createPlaylist(@CurrentUser() userId: string, @Body() body: { name: string; description?: string }) {
    return this.userService.createPlaylist(userId, body.name, body.description);
  }

  @Post('playlists/:id/items')
  async addPlaylistItem(@CurrentUser() userId: string, @Param('id') playlistId: string, @Body() body: { messageId: string }) {
    return this.userService.addPlaylistItem(userId, playlistId, { messageId: body.messageId });
  }

  @Delete('playlists/:id')
  async deletePlaylist(@CurrentUser() userId: string, @Param('id') playlistId: string) {
    return this.userService.deletePlaylist(userId, playlistId);
  }

  @Delete('playlists/:id/items/:messageId')
  async removePlaylistItem(@CurrentUser() userId: string, @Param('id') playlistId: string, @Param('messageId') messageId: string) {
    return this.userService.removePlaylistItem(userId, playlistId, { messageId });
  }

  @Get('progress')
  async getPlaybackProgress(@CurrentUser() userId: string) {
    return this.userService.getPlaybackProgress(userId);
  }

  @Post('progress')
  async updatePlaybackProgress(
    @CurrentUser() userId: string, 
    @Body() body: { messageId: string; position: number; progress: number; isCompleted: boolean }
  ) {
    return this.userService.updatePlaybackProgress(userId, { messageId: body.messageId }, body.position, body.progress, body.isCompleted);
  }
}
