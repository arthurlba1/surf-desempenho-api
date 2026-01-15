import { UserRole } from '@/common/types/user-role.types';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddMemberToSchoolCommand {
  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  role: UserRole;
}
