import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateMyCompetitiveRecordCommand {
  @IsOptional()
  @IsString() name?: string;

  @IsOptional()
  @IsString() date?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  beach?: string;

  @IsOptional()
  @IsString()
  peakName?: string;

  @IsOptional()
  @IsString()
  responsibleAssociation?: string;

  @IsOptional()
  @IsString()
  placement?: string;

  @IsOptional()
  @IsString()
  prize?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipments?: string[];
}
