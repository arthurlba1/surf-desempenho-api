import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '@/common/types/user-role.types';
import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false })
  _id?: string; // Made optional for client-side generation

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ required: false })
  profilePictureUrl?: string;

  @Prop({ required: false })
  birthdate?: string;

  @Prop({ required: false })
  document?: string;

  @Prop({ required: false })
  currentActiveSchoolId?: string;

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ document: 1 }, { unique: true, sparse: true });
