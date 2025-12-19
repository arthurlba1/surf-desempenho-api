import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AthleteEquipmentDocument = AthleteEquipment & Document;

export enum EquipmentType {
  CPQ = 'cpq',
  BOARDS = 'boards',
  FINS = 'fins',
}

@Schema({ timestamps: true })
export class AthleteEquipment {
  @Prop({ required: true })
  athleteId: string;

  @Prop({ required: true, enum: EquipmentType })
  type: EquipmentType;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  date?: string;
}

export const AthleteEquipmentSchema = SchemaFactory.createForClass(AthleteEquipment);

