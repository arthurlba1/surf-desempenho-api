import { ClientSession } from 'mongoose';

import { ListSchoolMembersResponseDto } from '@/common/dtos/list-school-members-response.dto';
import { CreateMembershipRelationDto } from "@/memberships/dtos/create-membership-relation.dto";
import { MembershipResponseDto } from "@/memberships/dtos/membership-response.dto";

export abstract class IMembershipRepository {
  abstract create(data: CreateMembershipRelationDto, session?: ClientSession): Promise<MembershipResponseDto>;
  abstract findByUserIdAndSchoolId(userId: string, schoolId: string, session?: ClientSession): Promise<MembershipResponseDto | null>;
  abstract findByUserId(userId: string, session?: ClientSession): Promise<MembershipResponseDto[]>;
  abstract findBySchoolId(schoolId: string, session?: ClientSession): Promise<MembershipResponseDto[]>;
  abstract findMembersWithUserNameBySchoolId(schoolId: string, session?: ClientSession): Promise<ListSchoolMembersResponseDto[]>;
}
