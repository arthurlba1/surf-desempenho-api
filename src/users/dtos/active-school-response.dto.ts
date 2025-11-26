import { Expose, plainToInstance } from "class-transformer";
import { IsBoolean, IsString } from "class-validator";

import { MembershipRole } from "@/memberships/schemas/membership.schema";

class ActiveSchoolResponseDto {
  @Expose()
  @IsString()
  schoolId: string;

  @Expose()
  @IsString()
  schoolName: string;

  @Expose()
  @IsString()
  role: MembershipRole;

  @Expose()
  @IsBoolean()
  isActive: boolean;
}

export { ActiveSchoolResponseDto };