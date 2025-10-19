import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from '@/users/users.controller';
import { UserRepository } from '@/users/infrastructure/user.repository';
import { User, UserSchema } from '@/users/schemas/user.schema';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { UpdateUserInformationsUseCase } from './use-cases/update-user-informations-use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    { provide: IUserRepository, useClass: UserRepository },
    UpdateUserInformationsUseCase,
  ],
  controllers: [UsersController],
  exports: [IUserRepository],
})
export class UsersModule {}
