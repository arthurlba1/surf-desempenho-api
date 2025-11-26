
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '@/users/types/user-role.type';
import { MembershipRole } from '@/memberships/schemas/membership.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ required: false })
  profilePictureUrl: string;

  @Prop({ required: false })
  birthdate: string;

  @Prop({ required: false, unique: true })
  document: string;

  @Prop({ required: false })
  currentActiveSchoolId: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
