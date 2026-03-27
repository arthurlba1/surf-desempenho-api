import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { randomBytes } from 'crypto';

import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export type SchoolDocument = School & Document;

@Schema({ timestamps: true })
export class School {
  @Prop({ required: false }) // _id can be generated on client
  _id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId: string;

  // Permanent invite token for MVP. Generated server-side on create.
  // - unique+sparse to avoid index issues for legacy docs without this field
  @Prop({
    required: false,
    unique: true,
    sparse: true,
    index: true,
    default: () => randomBytes(16).toString('hex'),
  })
  inviteToken?: string;

  /**
   * TEMPORARY: short human-readable code for join-by-code flow (same as invite, resolves to school).
   * Remove when the real invite/product flow ships.
   */
  @Prop({ required: false, unique: true, sparse: true, index: true })
  tempJoinCode?: string;

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;

  @Prop({ default: true, required: false })
  onHold?: boolean;

  @Prop({ required: false })
  logoUrl?: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
