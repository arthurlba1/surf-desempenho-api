import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export type UploadedAudioFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export class SendAudioMessageCommand {
  sessionId?: string;
  file?: UploadedAudioFile;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  duration?: number;
}
