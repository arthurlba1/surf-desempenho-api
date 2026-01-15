import { ApiProperty } from '@nestjs/swagger';
import { MembershipStatus } from '@/school/schemas/membership.schema';

export class SchoolAthleteResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  profilePictureUrl?: string | null;

  @ApiProperty({ enum: MembershipStatus })
  membershipStatus: MembershipStatus;

  @ApiProperty({ description: 'Total sessions participated (0 until training-session read model exists)' })
  sessionsParticipatedTotal: number;
}
