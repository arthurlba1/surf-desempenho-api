import { IsNotEmpty, IsString } from "class-validator";

export class ListSchoolMembersDto {
  @IsNotEmpty()
  @IsString()
  schoolId: string;
}
