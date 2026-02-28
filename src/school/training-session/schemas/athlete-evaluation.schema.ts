import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AthleteEvaluationDocument = AthleteEvaluation & Document;

@Schema({ timestamps: true })
export class AthleteEvaluation {
  @Prop({ required: true, index: true })
  trainingSessionId: string;

  @Prop({ required: true, index: true })
  schoolId: string;

  @Prop({ required: true, index: true })
  athleteId: string;

  @Prop() perceivedFluidity?: string;
  @Prop() perceivedSpeed?: string;
  @Prop() power?: string;
  @Prop() varietyOfManeuvers?: string;
  @Prop() combinationOfManeuvers?: string;
  @Prop() completionRate?: number;
  @Prop() commitment?: string;
  @Prop() overallTrainingVolume?: string;
  @Prop() adherenceToProposal?: string;
  @Prop() motivation?: string;
  @Prop() nps?: number;
}

export const AthleteEvaluationSchema = SchemaFactory.createForClass(AthleteEvaluation);
AthleteEvaluationSchema.index({ trainingSessionId: 1, athleteId: 1 }, { unique: true });
AthleteEvaluationSchema.index({ athleteId: 1, createdAt: -1 });
