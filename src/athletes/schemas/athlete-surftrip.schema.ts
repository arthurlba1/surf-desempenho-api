import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AthleteSurftripDocument = AthleteSurftrip & Document;

@Schema({ timestamps: true })
export class AthleteSurftrip {
  @Prop({ required: true })
  athleteId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  dateStart?: string;

  @Prop({ required: false })
  dateEnd?: string;

  @Prop({ required: false })
  location?: string;

  @Prop({ type: [String], required: false })
  quiver?: string[];

  @Prop({ required: false })
  physicalPerformance?: string;

  @Prop({ required: false })
  technicalPerformance?: string;

  @Prop({ type: [String], required: false })
  equipmentPerformance?: string[];

  @Prop({ required: false })
  planning?: string;

  @Prop({ required: false })
  accumulatedCompetencies?: string;

  @Prop({ required: false })
  coachFollowUp?: string;
}

export const AthleteSurftripSchema = SchemaFactory.createForClass(AthleteSurftrip);

