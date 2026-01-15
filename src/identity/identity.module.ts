import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '@/identity/infrastructure/schemas/user.schema';
import { UserRepository } from '@/identity/infrastructure/persistence/user.repository';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { CreateUserUseCase } from '@/identity/application/commands/create-user.use-case';
import { UpdateMeUseCase } from '@/identity/application/commands/update-me.use-case';
import { UpdateUserUseCase } from '@/identity/application/commands/update-user.use-case';
import { GetUserByIdUseCase } from '@/identity/application/queries/get-user-by-id.use-case';
import { GetUserLoginByEmailUseCase } from '@/identity/application/queries/get-user-by-email.use-case';
import { IdentityController } from '@/identity/controllers/identity.controller';
import { SchoolModule } from '@/school/school.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => SchoolModule),
  ],
  controllers: [IdentityController],
  providers: [
    {
      provide: IUserRepositoryPort,
      useClass: UserRepository,
    },
    CreateUserUseCase,
    UpdateMeUseCase,
    UpdateUserUseCase,
    GetUserByIdUseCase,
    GetUserLoginByEmailUseCase,
  ],
  exports: [
    IUserRepositoryPort,
    CreateUserUseCase,
    UpdateMeUseCase,
    UpdateUserUseCase,
    GetUserByIdUseCase,
    GetUserLoginByEmailUseCase,
  ],
})
export class IdentityModule {}
