import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AthleteBodyDataDocument = AthleteBodyData & Document;

@Schema({ timestamps: true })
export class AthleteBodyData {
  @Prop({ required: true })
  athleteId: string;

  @Prop({ required: false })
  weight?: string;

  @Prop({ required: false })
  height?: string;

  @Prop({ required: false })
  footSize?: string;

  @Prop({ required: false })
  predominantStance?: string;

  @Prop({ required: false })
  swimmingProficiency?: string;

  @Prop({ required: false })
  surfingStart?: string;

  @Prop({ required: false })
  emergencyProficiency?: string;

  @Prop({ required: false })
  emergencyContact?: string;

  @Prop({ required: false })
  healthPlan?: string;
}

export const AthleteBodyDataSchema = SchemaFactory.createForClass(AthleteBodyData);

