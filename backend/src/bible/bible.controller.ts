import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BibleService } from './bible.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('bible')
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @Get('books')
  async getBooks() {
    return this.bibleService.getBooks();
  }

  @Get(':bookId/:chapterId')
  async getChapter(@Param('bookId') bookId: string, @Param('chapterId') chapterId: string) {
    return this.bibleService.getChapter(bookId, chapterId);
  }

  // --- Protected Endpoints ---
  @Get('me/notes')
  @UseGuards(ClerkAuthGuard)
  async getNotes(@CurrentUser() userId: string) {
    return this.bibleService.getNotes(userId);
  }

  @Post('me/notes')
  @UseGuards(ClerkAuthGuard)
  async createNote(
    @CurrentUser() userId: string,
    @Body() body: { book: string; chapter: number; verse: number | null; content: string }
  ) {
    return this.bibleService.createNote(userId, body.book, body.chapter, body.verse, body.content);
  }

  @Delete('me/notes/:id')
  @UseGuards(ClerkAuthGuard)
  async deleteNote(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.bibleService.deleteNote(userId, id);
  }

  @Get('me/highlights')
  @UseGuards(ClerkAuthGuard)
  async getHighlights(@CurrentUser() userId: string) {
    return this.bibleService.getHighlights(userId);
  }

  @Post('me/highlights')
  @UseGuards(ClerkAuthGuard)
  async createHighlight(
    @CurrentUser() userId: string,
    @Body() body: { book: string; chapter: number; verse: number; colorHex: string }
  ) {
    return this.bibleService.createHighlight(userId, body.book, body.chapter, body.verse, body.colorHex);
  }

  @Delete('me/highlights/:id')
  @UseGuards(ClerkAuthGuard)
  async deleteHighlight(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.bibleService.deleteHighlight(userId, id);
  }
}
