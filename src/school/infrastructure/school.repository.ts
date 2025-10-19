import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";

import { RegisterSchoolDto } from "@/school/dtos/register-school.dto";
import { SchoolResponseDto } from "@/school/dtos/school-response.dto";
import { School, SchoolDocument } from "@/school/schemas/school.schema";
import { ISchoolRepository } from "@/school/repositories/school.repository.interface";

@Injectable()
export class SchoolRepository implements ISchoolRepository {
  constructor(@InjectModel(School.name) private schoolModel: Model<SchoolDocument>) {}

  async create(data: RegisterSchoolDto, session?: ClientSession): Promise<SchoolResponseDto> {
    const school = await new this.schoolModel(data).save({ session });
    return SchoolResponseDto.fromEntity(school);
  }

  async findById(id: string, session?: ClientSession): Promise<SchoolResponseDto | null> {
    const school = await this.schoolModel.findById(id, null, { session }).exec();
    return school ? SchoolResponseDto.fromEntity(school) : null;
  }
}
