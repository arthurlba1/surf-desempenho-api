import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PerformanceItemDto {
  @IsString()
  setupId: string;

  @IsEnum(['very bad', 'bad', 'good', 'very good'])
  performance: string;
}

export class CreateMySurftripCommand {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quiver?: string[];

  @IsOptional()
  @IsEnum(['very bad', 'bad', 'good', 'very good'])
  technicalPerformance?: string;

  @IsOptional()
  @IsEnum(['very bad', 'bad', 'good', 'very good'])
  physicalPerformance?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerformanceItemDto)
  performance?: PerformanceItemDto[];

  @IsOptional()
  @IsString()
  planning?: string;

  @IsOptional()
  @IsString()
  accumulatedSkills?: string;

  @IsOptional()
  @IsBoolean()
  accompaniedByCoach?: boolean;
}
