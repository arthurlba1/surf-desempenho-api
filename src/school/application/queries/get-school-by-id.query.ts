import { IsNotEmpty, IsString } from 'class-validator';

export class GetSchoolByIdQuery {
  @IsNotEmpty()
  @IsString()
  id: string;
}
