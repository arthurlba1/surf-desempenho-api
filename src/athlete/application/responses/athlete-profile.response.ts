import { ApiProperty } from '@nestjs/swagger';

export class AthleteProfileResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  birthdate?: string;

  @ApiProperty({ required: false })
  profilePictureUrl?: string;

  @ApiProperty({ required: false })
  weight?: string;

  @ApiProperty({ required: false })
  height?: string;

  @ApiProperty({ required: false })
  footSize?: string;

  @ApiProperty({ required: false })
  predominantStance?: string;

  @ApiProperty({ required: false })
  swimmingProficiency?: string;

  @ApiProperty({ required: false })
  surfingStart?: string;

  @ApiProperty({ required: false })
  emergencyProficiency?: string;

  @ApiProperty({ required: false })
  emergencyContact?: string;

  @ApiProperty({ required: false })
  healthPlan?: string;
}
