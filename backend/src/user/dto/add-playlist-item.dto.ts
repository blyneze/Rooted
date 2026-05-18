import { IsString, IsOptional } from 'class-validator';

export class AddPlaylistItemDto {
  @IsString()
  @IsOptional()
  messageId?: string;

  @IsString()
  @IsOptional()
  videoId?: string;
}
