import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export type FinDocument = Fin & Document;

@Schema({ timestamps: true, _id: true })
export class Fin {
  @Prop({ required: true, index: true })
  ownerId: string; // userId (global ownership)

  @Prop()
  name?: string;

  @Prop()
  model?: string;

  @Prop()
  set?: string;

  @Prop({ type: Number })
  size?: number;

  @Prop({ type: Number })
  area?: number;

  @Prop({ type: Number })
  rake?: number;

  @Prop({ type: Number })
  base?: number;

  @Prop({ type: Number })
  height?: number;

  @Prop()
  foil?: string;

  @Prop()
  material?: string;

  @Prop()
  system?: string;

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;
}

export const FinSchema = SchemaFactory.createForClass(Fin);
FinSchema.index({ ownerId: 1 });
