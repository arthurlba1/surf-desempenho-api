import { IsOptional, IsString } from 'class-validator';

export class UpdateMeCommand {
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  birthdate?: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  version?: number; // optimistic locking (phase 2+)
}
