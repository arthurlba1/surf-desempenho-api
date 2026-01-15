import { IsArray, IsDateString, IsNumber, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncCommand {
  @IsUUID()
  commandId: string;

  @IsString()
  commandType: string;

  @IsString()
  actorUserId: string;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsObject()
  payload: Record<string, any>;

  @IsNumber()
  clientSequence: number;

  @IsDateString()
  createdAt: string;

  @IsOptional()
  @IsNumber()
  version?: number;
}

export class SyncCommandsCommand {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncCommand)
  commands: SyncCommand[];
}
