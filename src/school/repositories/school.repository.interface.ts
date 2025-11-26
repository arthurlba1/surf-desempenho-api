import { ClientSession } from 'mongoose';

import { RegisterSchoolDto } from "@/school/dtos/register-school.dto";
import { SchoolDocument } from '@/school/schemas/school.schema';

export abstract class ISchoolRepository {
  abstract create(data: RegisterSchoolDto, session?: ClientSession): Promise<SchoolDocument>;
  abstract findById(id: string, session?: ClientSession): Promise<SchoolDocument | null>;
  abstract findManyByIds(ids: string[], session?: ClientSession): Promise<SchoolDocument[]>;
}
