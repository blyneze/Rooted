import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateHighlightDto {
  @IsString()
  @IsNotEmpty()
  book: string;

  @IsNumber()
  @IsNotEmpty()
  chapter: number;

  @IsNumber()
  @IsNotEmpty()
  verse: number;

  @IsString()
  @IsNotEmpty()
  colorHex: string;
}
