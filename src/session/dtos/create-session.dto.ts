import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

import { SeaType } from '@/session/types/sea';

class CreateSeaConditionsDto {
  @Expose()
  @IsOptional()
  seaType?: SeaType;

  @Expose()
  @IsOptional()
  seabed?: string;

  @Expose()
  @IsOptional()
  swellConsistency?: string;

  @Expose()
  @IsOptional()
  windInterference?: string;

  @Expose()
  @IsOptional()
  crowdSituation?: string;

  @Expose()
  @IsOptional()
  waterTemperature?: string;

  @Expose()
  @IsOptional()
  nps?: number;
}

class CreateWaveConditionsDto {
  @Expose() @IsOptional() speed?: string;
  @Expose() @IsOptional() waveShape?: string;
  @Expose() @IsOptional() riskLevel?: string;
  @Expose() @IsOptional() waveExtension?: string;
  @Expose() @IsOptional() maneuveringOpportunities?: string;
  @Expose() @IsOptional() dropCondition?: string;
  @Expose() @IsOptional() nps?: number;
}

class CreateSessionAthleteDto {
  @Expose() @IsString() userId: string;
  @Expose() @IsString() name: string;
}

class CreateSessionLocationDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  log?: number;
}

export class CreateSessionDto {
  @Expose()
  @IsOptional()
  @IsString()
  schoolId: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  inProgress?: boolean;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  duration: number;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  totalDuration?: number;

  @Expose()
  @IsOptional()
  @Type(() => CreateSeaConditionsDto)
  seaConditions?: CreateSeaConditionsDto;

  @Expose()
  @IsOptional()
  @Type(() => CreateWaveConditionsDto)
  waveConditions?: CreateWaveConditionsDto;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSessionAthleteDto)
  athletes?: CreateSessionAthleteDto[];

  @Expose()
  @IsOptional()
  @Type(() => CreateSessionAthleteDto)
  coach?: CreateSessionAthleteDto;

  @Expose()
  @IsOptional()
  @Type(() => CreateSessionLocationDto)
  location?: CreateSessionLocationDto;
}

export {
  CreateSeaConditionsDto,
  CreateWaveConditionsDto,
  CreateSessionAthleteDto,
  CreateSessionLocationDto,
};

