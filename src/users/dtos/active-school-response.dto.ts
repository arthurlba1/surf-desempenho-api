import { Expose, plainToInstance } from "class-transformer";
import { IsBoolean, IsString } from "class-validator";

import { MembershipRole } from "@/memberships/schemas/membership.schema";
import { ActiveSchool } from "@/users/schemas/active-school.schema";

class ActiveSchoolResponseDto {
  @Expose()
  @IsString()
  schoolId: string;

  @Expose()
  @IsString()
  role: MembershipRole;

  @Expose()
  @IsBoolean()
  isActive: boolean;

  static fromEntity(entity: ActiveSchool): ActiveSchoolResponseDto {
    return plainToInstance(ActiveSchoolResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: ActiveSchool[]): ActiveSchoolResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}

export { ActiveSchoolResponseDto };