import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MembershipsModule } from '@/memberships/memberships.module';
import { School, SchoolSchema } from '@/school/schemas/school.schema';
import { SchoolRepository } from '@/school/infrastructure/school.repository';
import { ISchoolRepository } from '@/school/repositories/school.repository.interface';
import { SchoolController } from '@/school/school.controller';
import { ListSchoolMembersUseCase } from '@/school/use-cases/list-school-members';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    MembershipsModule,
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]),
  ],
  providers: [
    { provide: ISchoolRepository, useClass: SchoolRepository },
    ListSchoolMembersUseCase,
  ],
  exports: [ISchoolRepository],
  controllers: [SchoolController],
})
export class SchoolModule {}
