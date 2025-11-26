import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class SessionAthleteDto {
  @Expose() @IsString() userId: string;
  @Expose() @IsString() name: string;
}

export class DeleteAthletesDto {
  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionAthleteDto)
  athletes?: SessionAthleteDto[];
}
