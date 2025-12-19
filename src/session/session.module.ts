import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SessionController } from '@/session/session.controller';
import { Session, SessionSchema } from '@/session/schemas/session.schema';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';
import { SessionRepository } from '@/session/infrastructure/session.repository';
import { CreateSessionUseCase } from '@/session/use-cases/create-session.use-case';
import { UpdateSessionUseCase } from '@/session/use-cases/update-session.use-case';
import { GetSessionUseCase } from '@/session/use-cases/get-session.use-case';
import { DeleteAthleteFromSessionUseCase } from '@/session/use-cases/delete-athlete-from-session.use-case';
import { ListSessionsUseCase } from '@/session/use-cases/list-sessions.use-case';
import { MembershipsModule } from '@/memberships/memberships.module';
import { UsersModule } from '@/users/users.module';
import { SchoolModule } from '@/school/school.module';

@Module({
  imports: [
    MembershipsModule,
    UsersModule,
    SchoolModule,
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }])
  ],
  providers: [
    { provide: ISessionRepository, useClass: SessionRepository },
    CreateSessionUseCase,
    UpdateSessionUseCase,
    GetSessionUseCase,
    DeleteAthleteFromSessionUseCase,
    ListSessionsUseCase,
  ],
  controllers: [SessionController],
  exports: [ISessionRepository],
})

export class SessionModule {}
