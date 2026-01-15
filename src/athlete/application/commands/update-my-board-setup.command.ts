import { IsOptional, IsString } from 'class-validator';

export class UpdateMyBoardSetupCommand {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() surfboardId?: string;
  @IsOptional() @IsString() finIds?: string;
  @IsOptional() @IsString() notes?: string;
}
