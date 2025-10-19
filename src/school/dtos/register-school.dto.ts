import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RegisterSchoolDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsNotEmpty()
  @IsString()
  owner: string;

  @IsOptional()
  @IsBoolean()
  onHold: boolean;
}
