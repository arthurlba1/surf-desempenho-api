import { Expose } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';

export class AthleteEquipmentResponseDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @IsString()
  @IsOptional()
  date?: string;
}

