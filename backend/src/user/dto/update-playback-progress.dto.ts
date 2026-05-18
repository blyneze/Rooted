import { IsString, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdatePlaybackProgressDto {
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @IsNumber()
  @IsNotEmpty()
  position: number;

  @IsNumber()
  @IsNotEmpty()
  progress: number;

  @IsBoolean()
  @IsNotEmpty()
  isCompleted: boolean;
}
