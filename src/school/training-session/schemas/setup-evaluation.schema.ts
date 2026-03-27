import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SetupEvaluationDocument = SetupEvaluation & Document;

export type SetupEvaluationSource = 'coach' | 'self';

@Schema({ timestamps: true })
export class SetupEvaluation {
  @Prop({ required: true, index: true })
  trainingSessionId: string;

  @Prop({ required: true, index: true })
  schoolId: string;

  @Prop({ required: true, index: true })
  athleteId: string;

  @Prop({ required: true, index: true })
  setupId: string;

  @Prop({ enum: ['coach', 'self'], default: 'coach' })
  source?: SetupEvaluationSource;

  @Prop() cruisingSpeed?: string;
  @Prop() attackSpeed?: string;
  @Prop() submergedSpeed?: string;
  @Prop() overallBoardFlow?: string;
  @Prop() perceivedSpeed?: string;
  @Prop() maneuverability?: string;
  @Prop() control?: string;
  @Prop() nps?: number;
}

export const SetupEvaluationSchema = SchemaFactory.createForClass(SetupEvaluation);
SetupEvaluationSchema.index({ trainingSessionId: 1, setupId: 1, source: 1 }, { unique: true });
SetupEvaluationSchema.index({ athleteId: 1, createdAt: -1 });
