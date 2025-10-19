import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MembershipRole {
  COACH = 'COACH',
  SURFER = 'SURFER',
}

export type MembershipDocument = Membership & Document;

@Schema({ timestamps: false })
export class Membership {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ enum: ['COACH','SURFER'], required: true })
  role: MembershipRole;

  @Prop({ default: true }) isActive: boolean;

  @Prop({ required: true, default: Date.now })
  joinedAt: Date;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

MembershipSchema.index({ schoolId: 1, role: 1, isActive: 1 });
MembershipSchema.index({ userId: 1, schoolId: 1 }, { unique: true });