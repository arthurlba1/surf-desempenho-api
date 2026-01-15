import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export type SchoolInviteDocument = SchoolInvite & Document;

@Schema({ timestamps: true })
export class SchoolInvite {
  @Prop({ required: false })
  _id?: string;

  @Prop({ required: true })
  schoolId: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;
}

export const SchoolInviteSchema = SchemaFactory.createForClass(SchoolInvite);
