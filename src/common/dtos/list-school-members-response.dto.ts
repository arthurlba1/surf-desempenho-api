import { Expose } from "class-transformer";
import { IsBoolean, IsString } from "class-validator";

export class ListSchoolMembersResponseDto {
  @Expose()
  @IsString()
  userId: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  role: string;

  @Expose()
  @IsBoolean()
  isActive: boolean;
}

