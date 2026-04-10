import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('content')
// Optional: UseGuards(ClerkAuthGuard) if content requires login
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('home')
  async getHomeFeed() {
    return this.contentService.getHomeFeed();
  }

  @Get('messages')
  async getMessages(@Query('q') query?: string) {
    return this.contentService.getMessages(query);
  }

  @Get('messages/:id')
  async getMessageById(@Param('id') id: string) {
    return this.contentService.getMessageById(id);
  }

  @Get('series')
  async getSeries() {
    return this.contentService.getSeries();
  }

  @Get('series/:id')
  async getSeriesById(@Param('id') id: string) {
    return this.contentService.getSeriesById(id);
  }

  @Get('books')
  async getBooks() {
    return this.contentService.getBooks();
  }

  @Get('books/:id')
  async getBookById(@Param('id') id: string) {
    return this.contentService.getBookById(id);
  }
}
