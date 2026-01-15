import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export type SurfboardDocument = Surfboard & Document;

@Schema({ timestamps: true, _id: true })
export class Surfboard {
  @Prop({ required: true, index: true })
  ownerId: string;

  @Prop()
  name?: string;

  @Prop()
  model?: string;

  @Prop({ type: Number })
  size?: number;

  @Prop({ type: Number })
  width?: number;

  @Prop()
  fractionalInches?: string;

  @Prop({ type: Number })
  thickness?: number;

  @Prop({ type: Number })
  volume?: number;

  @Prop()
  tail?: string;

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;
}

export const SurfboardSchema = SchemaFactory.createForClass(Surfboard);
SurfboardSchema.index({ ownerId: 1 });
