import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export type BoardSetupDocument = BoardSetup & Document;

@Schema({ timestamps: true, _id: true })
export class BoardSetup {
  @Prop({ required: true, index: true })
  ownerId: string; // userId (global ownership)

  @Prop() name?: string;
  @Prop() surfboardId?: string;
  @Prop() finIds?: string; // MVP: store as string (e.g., comma-separated) to keep schema simple
  @Prop() notes?: string;

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;
}

export const BoardSetupSchema = SchemaFactory.createForClass(BoardSetup);
BoardSetupSchema.index({ ownerId: 1 });
