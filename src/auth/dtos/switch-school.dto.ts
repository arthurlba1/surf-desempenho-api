import { IsNotEmpty, IsString } from "class-validator";

export class SwitchSchoolDto {
  @IsNotEmpty()
  @IsString()
  schoolId: string;
}
