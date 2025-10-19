
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MembershipRole } from '@/memberships/schemas/membership.schema';

export type ActiveSchoolDocument = ActiveSchool & Document;

@Schema({ timestamps: false, _id: false, id: false })
export class ActiveSchool {
  @Prop({ required: true })
  schoolId: string;

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ required: true, enum: MembershipRole })
  role: MembershipRole;
}

export const ActiveSchoolSchema = SchemaFactory.createForClass(ActiveSchool);
