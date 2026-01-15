import { IsOptional, IsString } from 'class-validator';

export class UpdateUserCommand {
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
  version?: number; // For optimistic locking
}
