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

export class CreateTrainingSessionCommand {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  participants: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  status?: 'scheduled' | 'in-progress';

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startTime?: Date;
}
