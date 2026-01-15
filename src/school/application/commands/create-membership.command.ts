import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { MembershipRole, MembershipStatus } from '@/school/schemas/membership.schema';

export class CreateMembershipCommand {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @IsNotEmpty()
  @IsEnum(MembershipRole)
  role: MembershipRole;

  @IsNotEmpty()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;
}
