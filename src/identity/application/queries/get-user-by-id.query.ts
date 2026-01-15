import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserByIdQuery {
  @IsNotEmpty()
  @IsString()
  id: string;
}
