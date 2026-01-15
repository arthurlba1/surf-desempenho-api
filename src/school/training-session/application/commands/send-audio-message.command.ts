import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendAudioMessageCommand {
  sessionId?: string;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsNotEmpty()
  @IsString()
  audioUrl: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
}
