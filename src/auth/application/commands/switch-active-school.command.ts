import { IsString } from 'class-validator';

export class SwitchActiveSchoolCommand {
  @IsString()
  schoolId: string;
}
