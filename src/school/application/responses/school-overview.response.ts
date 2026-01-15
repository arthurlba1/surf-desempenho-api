import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SchoolOverviewAthletesResponse {
  @ApiProperty()
  totalEnrolled: number;
}

export class SchoolOverviewCoachesResponse {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalActive: number;
}

export class SchoolOverviewTrainingSessionsResponse {
  @ApiPropertyOptional()
  total?: number;

  @ApiPropertyOptional()
  totalParticipated?: number;
}

export class SchoolOverviewResponse {
  @ApiProperty({ enum: ['COACH', 'SURFER'] })
  role: 'COACH' | 'SURFER';

  @ApiProperty({ description: 'Server timestamp for when this snapshot was generated (ISO string)' })
  asOf: string;

  @ApiPropertyOptional({ type: () => SchoolOverviewAthletesResponse })
  athletes?: SchoolOverviewAthletesResponse;

  @ApiPropertyOptional({ type: () => SchoolOverviewCoachesResponse })
  coaches?: SchoolOverviewCoachesResponse;

  @ApiProperty({ type: () => SchoolOverviewTrainingSessionsResponse })
  trainingSessions: SchoolOverviewTrainingSessionsResponse;
}
