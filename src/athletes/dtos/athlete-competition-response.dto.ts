import { Expose } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';

export class AthleteCompetitionResponseDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @IsOptional()
  date?: string;

  @Expose()
  @IsString()
  @IsOptional()
  location?: string;

  @Expose()
  @IsString()
  @IsOptional()
  association?: string;

  @Expose()
  @IsString()
  @IsOptional()
  placement?: string;

  @Expose()
  @IsString()
  @IsOptional()
  prize?: string;

  @Expose()
  @IsString()
  @IsOptional()
  equipment?: string;
}

