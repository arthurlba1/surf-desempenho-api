import { CreateMembershipRelationDto } from "@/memberships/dtos/create-membership-relation.dto";
import { MembershipResponseDto } from "@/memberships/dtos/membership-response.dto";
import { ClientSession } from 'mongoose';

export abstract class IMembershipRepository {
  abstract create(data: CreateMembershipRelationDto, session?: ClientSession): Promise<MembershipResponseDto>;
  abstract findByUserIdAndSchoolId(userId: string, schoolId: string, session?: ClientSession): Promise<MembershipResponseDto | null>;
  abstract findByUserId(userId: string, session?: ClientSession): Promise<MembershipResponseDto[]>;
  abstract findBySchoolId(schoolId: string, session?: ClientSession): Promise<MembershipResponseDto[]>;
}
