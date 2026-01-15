import { ApiProperty } from '@nestjs/swagger';

export class SchoolInfo {
  @ApiProperty({ required: false })
  id?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  status: string;
}

export class LoggedUserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ required: false })
  profilePictureUrl?: string;

  @ApiProperty({ required: false })
  birthdate?: string;

  @ApiProperty({ required: false })
  document?: string;

  @ApiProperty({ required: false })
  currentActiveSchoolId?: string;

  @ApiProperty({ type: [SchoolInfo] })
  schools: SchoolInfo[];
}
