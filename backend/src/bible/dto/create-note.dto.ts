import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  book: string;

  @IsNumber()
  @IsNotEmpty()
  chapter: number;

  @IsNumber()
  @IsOptional()
  verse: number | null;

  @IsString()
  @IsNotEmpty()
  content: string;
}
