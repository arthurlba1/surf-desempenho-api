import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AthleteCompetitionDocument = AthleteCompetition & Document;

@Schema({ timestamps: true })
export class AthleteCompetition {
  @Prop({ required: true })
  athleteId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  date?: string;

  @Prop({ required: false })
  location?: string;

  @Prop({ required: false })
  association?: string;

  @Prop({ required: false })
  placement?: string;

  @Prop({ required: false })
  prize?: string;

  @Prop({ required: false })
  equipment?: string;
}

export const AthleteCompetitionSchema = SchemaFactory.createForClass(AthleteCompetition);

