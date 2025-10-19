import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import crypto from 'node:crypto';

export type SchoolDocument = School & Document;

@Schema({ timestamps: true })
export class School {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: string;

  @Prop({ default: true })
  onHold: boolean;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
