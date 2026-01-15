import { IsOptional, IsString } from 'class-validator';

export class UpsertMyAthleteProfileCommand {
  @IsOptional() @IsString() weight?: string;
  @IsOptional() @IsString() height?: string;
  @IsOptional() @IsString() footSize?: string;
  @IsOptional() @IsString() predominantStance?: string;
  @IsOptional() @IsString() swimmingProficiency?: string;
  @IsOptional() @IsString() surfingStart?: string;
  @IsOptional() @IsString() emergencyProficiency?: string;
  @IsOptional() @IsString() emergencyContact?: string;
  @IsOptional() @IsString() healthPlan?: string;
}
