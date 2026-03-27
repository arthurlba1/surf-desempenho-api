import { IsEnum, IsOptional } from 'class-validator';
import { SelfEvaluationLevel } from '@/school/training-session/schemas/training-session.schema';

export class SubmitSelfEvaluationCommand {
  @IsOptional()
  @IsEnum(SelfEvaluationLevel)
  physicalEffortIntensity?: string;

  @IsOptional()
  @IsEnum(SelfEvaluationLevel)
  positiveAffect?: string;

  @IsOptional()
  @IsEnum(SelfEvaluationLevel)
  negativeAffect?: string;
}
