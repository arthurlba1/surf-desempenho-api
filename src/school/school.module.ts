import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { School, SchoolSchema } from '@/school/schemas/school.schema';
import { SchoolRepository } from '@/school/infrastructure/persistence/school.repository';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { CreateSchoolUseCase } from '@/school/application/commands/create-school.use-case';
import { AddMemberToSchoolUseCase } from '@/school/application/commands/add-member-to-school.use-case';
import { GetSchoolByIdUseCase } from '@/school/application/queries/get-school-by-id.use-case';
import { SchoolController } from '@/school/controllers/school.controller';
import { Membership, MembershipSchema } from '@/school/schemas/membership.schema';
import { MembershipRepository } from '@/school/infrastructure/persistence/membership.repository';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { CreateMembershipUseCase } from '@/school/application/commands/create-membership.use-case';
import { MembershipSchoolMapperService } from '@/school/application/services/membership-school-mapper.service';
import { GetSchoolOverviewUseCase } from '@/school/application/queries/get-school-overview.use-case';
import { IdentityModule } from '@/identity/identity.module';
import { GetSchoolAthletesUseCase } from '@/school/application/queries/get-school-athletes.use-case';
import { JoinSchoolInviteUseCase } from '@/school/application/commands/join-school-invite.use-case';
import { GetSchoolInviteLinkUseCase } from '@/school/application/queries/get-school-invite-link.use-case';
import { TrainingSessionModule } from '@/school/training-session/training-session.module';
import { AcceptSchoolAthleteUseCase } from '@/school/application/commands/accept-school-athlete.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: School.name, schema: SchoolSchema },
      { name: Membership.name, schema: MembershipSchema },
    ]),
    forwardRef(() => IdentityModule),
    forwardRef(() => TrainingSessionModule),
  ],
  controllers: [SchoolController],
  providers: [
    {
      provide: ISchoolRepositoryPort,
      useClass: SchoolRepository,
    },
    {
      provide: IMembershipRepositoryPort,
      useClass: MembershipRepository,
    },
    CreateSchoolUseCase,
    AddMemberToSchoolUseCase,
    GetSchoolByIdUseCase,
    GetSchoolOverviewUseCase,
    GetSchoolAthletesUseCase,
    JoinSchoolInviteUseCase,
    GetSchoolInviteLinkUseCase,
    AcceptSchoolAthleteUseCase,
    CreateMembershipUseCase,
    MembershipSchoolMapperService,
  ],
  exports: [
    ISchoolRepositoryPort,
    IMembershipRepositoryPort,
    CreateSchoolUseCase,
    AddMemberToSchoolUseCase,
    GetSchoolByIdUseCase,
    GetSchoolOverviewUseCase,
    GetSchoolAthletesUseCase,
    JoinSchoolInviteUseCase,
    GetSchoolInviteLinkUseCase,
    AcceptSchoolAthleteUseCase,
    CreateMembershipUseCase,
    MembershipSchoolMapperService,
  ],
})
export class SchoolModule {}
