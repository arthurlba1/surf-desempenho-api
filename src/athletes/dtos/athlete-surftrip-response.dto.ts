import { Expose } from 'class-transformer';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class AthleteSurftripResponseDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @IsOptional()
  dateStart?: string;

  @Expose()
  @IsString()
  @IsOptional()
  dateEnd?: string;

  @Expose()
  @IsString()
  @IsOptional()
  location?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  quiver?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  physicalPerformance?: string;

  @Expose()
  @IsString()
  @IsOptional()
  technicalPerformance?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  equipmentPerformance?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  planning?: string;

  @Expose()
  @IsString()
  @IsOptional()
  accumulatedCompetencies?: string;

  @Expose()
  @IsString()
  @IsOptional()
  coachFollowUp?: string;
}

