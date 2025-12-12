import { Expose } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';

export class AthleteBodyDataResponseDto {
  @Expose()
  @IsString()
  @IsOptional()
  weight?: string;

  @Expose()
  @IsString()
  @IsOptional()
  height?: string;

  @Expose()
  @IsString()
  @IsOptional()
  footSize?: string;

  @Expose()
  @IsString()
  @IsOptional()
  predominantStance?: string;

  @Expose()
  @IsString()
  @IsOptional()
  swimmingProficiency?: string;

  @Expose()
  @IsString()
  @IsOptional()
  surfingStart?: string;

  @Expose()
  @IsString()
  @IsOptional()
  emergencyProficiency?: string;

  @Expose()
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @Expose()
  @IsString()
  @IsOptional()
  healthPlan?: string;
}

