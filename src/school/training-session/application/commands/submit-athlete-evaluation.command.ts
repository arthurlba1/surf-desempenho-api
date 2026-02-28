import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SubmitAthleteEvaluationCommand {
  @IsString()
  athleteId: string;

  @IsOptional()
  @IsString()
  perceivedFluidity?: string;

  @IsOptional()
  @IsString()
  perceivedSpeed?: string;

  @IsOptional()
  @IsString()
  power?: string;

  @IsOptional()
  @IsString()
  varietyOfManeuvers?: string;

  @IsOptional()
  @IsString()
  combinationOfManeuvers?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionRate?: number;

  @IsOptional()
  @IsString()
  commitment?: string;

  @IsOptional()
  @IsString()
  overallTrainingVolume?: string;

  @IsOptional()
  @IsString()
  adherenceToProposal?: string;

  @IsOptional()
  @IsString()
  motivation?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  nps?: number;
}
