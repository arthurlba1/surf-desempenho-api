import { ClientSession } from 'mongoose';

import { CreateMembershipRelationDto } from "@/memberships/dtos/create-membership-relation.dto";
import { MembershipDocument } from '@/memberships/schemas/membership.schema';

export abstract class IMembershipRepository {
  abstract create(data: CreateMembershipRelationDto, session?: ClientSession): Promise<MembershipDocument>;
  abstract findByUserIdAndSchoolId(userId: string, schoolId: string, session?: ClientSession): Promise<MembershipDocument | null>;
  abstract findByUserId(userId: string, session?: ClientSession): Promise<MembershipDocument[]>;
  abstract findBySchoolId(schoolId: string, session?: ClientSession): Promise<any[]>;
  abstract findById(id: string, session?: ClientSession): Promise<MembershipDocument | null>;
  abstract findByUserIdWithSchoolName(userId: string, session?: ClientSession): Promise<any[]>;
}
