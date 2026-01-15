import { IsEmail, IsNotEmpty } from 'class-validator';

export class GetUserByEmailQuery {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
