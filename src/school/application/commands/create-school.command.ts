import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSchoolCommand {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  ownerId: string;
}
