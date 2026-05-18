import { IsString, IsOptional } from 'class-validator';

export class SaveItemDto {
  @IsString()
  @IsOptional()
  messageId?: string;

  @IsString()
  @IsOptional()
  bookId?: string;
}
