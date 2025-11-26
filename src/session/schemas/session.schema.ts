import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { SeaConditions, SeaConditionsSchema } from '@/session/schemas/sea-conditions.schema';
import { WaveConditions, WaveConditionsSchema } from '@/session/schemas/wave-conditions.schema';
import { SessionAthlete } from '@/session/schemas/athletes.schema';
import { SessionLocation, SessionLocationSchema } from '@/session/schemas/location.schema';

export const SessionAthleteSchema = SchemaFactory.createForClass(SessionAthlete);

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true })
  schoolId: string;

  @Prop({ required: true, default: 0 })
  duration: number

  @Prop({ required: false, default: 0 })
  totalDuration?: number;

  @Prop({ required: true, default: true })
  inProgress: boolean;

  @Prop({ type: SeaConditionsSchema, required: false })
  seaConditions?: SeaConditions;

  @Prop({ type: WaveConditionsSchema, required: false })
  waveConditions?: WaveConditions;
  
  @Prop({ type: SessionAthleteSchema, required: true })
  coach: SessionAthlete;

  @Prop({ type: [SessionAthleteSchema], required: false, default: [] })
  athletes?: SessionAthlete[];

  @Prop({ type: SessionLocationSchema, required: false })
  location?: SessionLocation;
}

export type SessionDocument = Session & Document;
export const SessionSchema = SchemaFactory.createForClass(Session);
