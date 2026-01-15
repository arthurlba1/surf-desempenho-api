import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  @IsString()
  name: string;
}

class SeaConditionsDto {
  @IsOptional()
  @IsString()
  seaType?: string;

  @IsOptional()
  @IsString()
  seabed?: string;

  @IsOptional()
  @IsString()
  swellConsistency?: string;

  @IsOptional()
  @IsString()
  windInterference?: string;

  @IsOptional()
  @IsString()
  crowdSituation?: string;

  @IsOptional()
  @IsString()
  waterTemperature?: string;

  @IsOptional()
  @IsNumber()
  nps?: number;
}

class WaveConditionsDto {
  @IsOptional()
  @IsString()
  speed?: string;

  @IsOptional()
  @IsString()
  waveShape?: string;

  @IsOptional()
  @IsString()
  riskLevel?: string;

  @IsOptional()
  @IsString()
  waveExtension?: string;

  @IsOptional()
  @IsString()
  maneuveringOpportunities?: string;

  @IsOptional()
  @IsString()
  dropCondition?: string;

  @IsOptional()
  @IsNumber()
  nps?: number;
}

export class UpdateTrainingSessionCommand {
  id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participants?: string[];

  @IsOptional()
  @IsString()
  status?: 'scheduled' | 'in-progress' | 'completed';

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startTime?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endTime?: Date;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  totalDuration?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeaConditionsDto)
  seaConditions?: SeaConditionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WaveConditionsDto)
  waveConditions?: WaveConditionsDto;
}
