import { IsNotEmpty, IsString, IsEnum } from "class-validator";
import { plainToInstance } from "class-transformer";

import { Membership, MembershipRole } from "@/memberships/schemas/membership.schema";

export class CreateMembershipRelationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @IsNotEmpty()
  @IsEnum(MembershipRole)
  role: MembershipRole;

  static fromEntity(entity: Membership): CreateMembershipRelationDto {
    return plainToInstance(CreateMembershipRelationDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
