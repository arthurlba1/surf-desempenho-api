import { IsNotEmpty, IsString } from 'class-validator';

export class JoinSchoolInviteCommand {
  @IsNotEmpty()
  @IsString()
  token: string;
}
