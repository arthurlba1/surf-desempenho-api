import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class AssociateUserToSchoolDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  schoolId: string;
}
