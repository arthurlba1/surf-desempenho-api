import { RegisterSchoolDto } from "@/school/dtos/register-school.dto";
import { SchoolResponseDto } from "@/school/dtos/school-response.dto";
import { ClientSession } from 'mongoose';

export abstract class ISchoolRepository {
  abstract create(data: RegisterSchoolDto, session?: ClientSession): Promise<SchoolResponseDto>;
  abstract findById(id: string, session?: ClientSession): Promise<SchoolResponseDto | null>;
}
