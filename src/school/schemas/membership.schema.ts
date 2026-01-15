import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export enum MembershipRole {
  COACH = 'COACH',
  HEADCOACH = 'HEADCOACH',
  SURFER = 'SURFER',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
}

export type MembershipDocument = Membership & Document;

@Schema({ timestamps: true })
export class Membership {
  @Prop({ required: false }) // _id can be generated on client
  _id?: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  schoolId: string;

  @Prop({ enum: ['COACH', 'HEADCOACH', 'SURFER'], required: true })
  role: MembershipRole;

  @Prop({ enum: ['ACTIVE', 'PENDING', 'BLOCKED'], default: MembershipStatus.PENDING, required: true })
  status: MembershipStatus;

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;

  @Prop({ required: true, default: Date.now })
  joinedAt: Date;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

MembershipSchema.index({ schoolId: 1, role: 1, status: 1 });
MembershipSchema.index({ userId: 1, schoolId: 1 }, { unique: true });
MembershipSchema.index({ userId: 1, status: 1 });

/**
 * Helper function to check if a membership role is a coach role (COACH or HEADCOACH)
 */
export function isCoachRole(role: MembershipRole): boolean {
  return role === MembershipRole.COACH || role === MembershipRole.HEADCOACH;
}