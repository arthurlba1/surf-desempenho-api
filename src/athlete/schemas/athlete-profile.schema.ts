import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export type AthleteProfileDocument = AthleteProfile & Document;

@Schema({ timestamps: true })
export class AthleteProfile {
  @Prop({ required: false }) // _id can be generated on client
  _id?: string;

  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop() weight?: string;
  @Prop() height?: string;
  @Prop() footSize?: string;
  @Prop() predominantStance?: string;
  @Prop() swimmingProficiency?: string;
  @Prop() surfingStart?: string;
  @Prop() emergencyProficiency?: string;
  @Prop() emergencyContact?: string;
  @Prop() healthPlan?: string;

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export const AthleteProfileSchema = SchemaFactory.createForClass(AthleteProfile);
