import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginQuery {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
