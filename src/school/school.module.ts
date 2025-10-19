import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { School, SchoolSchema } from '@/school/schemas/school.schema';
import { SchoolRepository } from '@/school/infrastructure/school.repository';
import { ISchoolRepository } from './repositories/school.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]),
  ],
  providers: [
    { provide: ISchoolRepository, useClass: SchoolRepository },
  ],
  exports: [ISchoolRepository],
})
export class SchoolModule {}
