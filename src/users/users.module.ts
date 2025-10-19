import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MembershipsModule } from '@/memberships/memberships.module';
import { SchoolModule } from '@/school/school.module';
import { UsersController } from '@/users/users.controller';
import { UserRepository } from '@/users/infrastructure/user.repository';
import { User, UserSchema } from '@/users/schemas/user.schema';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { AssociateUserToSchoolUseCase } from '@/users/use-cases/associate-user-to-school-user-case';
import { UpdateUserInformationsUseCase } from '@/users/use-cases/update-user-informations-use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MembershipsModule,
    SchoolModule,
  ],
  providers: [
    { provide: IUserRepository, useClass: UserRepository },
    AssociateUserToSchoolUseCase,
    UpdateUserInformationsUseCase
  ],
  controllers: [UsersController],
  exports: [IUserRepository],
})
export class UsersModule {}
