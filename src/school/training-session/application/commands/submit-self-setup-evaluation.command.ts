import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SubmitSelfSetupEvaluationCommand {
  @IsString()
  setupId: string;

  @IsOptional()
  @IsString()
  cruisingSpeed?: string;

  @IsOptional()
  @IsString()
  attackSpeed?: string;

  @IsOptional()
  @IsString()
  submergedSpeed?: string;

  @IsOptional()
  @IsString()
  overallBoardFlow?: string;

  @IsOptional()
  @IsString()
  perceivedSpeed?: string;

  @IsOptional()
  @IsString()
  maneuverability?: string;

  @IsOptional()
  @IsString()
  control?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  nps?: number;
}
