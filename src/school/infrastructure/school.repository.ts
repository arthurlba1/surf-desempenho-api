import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";

import { RegisterSchoolDto } from "@/school/dtos/register-school.dto";
import { School, SchoolDocument } from "@/school/schemas/school.schema";
import { ISchoolRepository } from "@/school/repositories/school.repository.interface";

@Injectable()
export class SchoolRepository implements ISchoolRepository {
  constructor(@InjectModel(School.name) private schoolModel: Model<SchoolDocument>) {}

  async create(data: RegisterSchoolDto, session?: ClientSession): Promise<SchoolDocument> {
    const school = await new this.schoolModel(data).save({ session });
    return school;
  }

  async findById(id: string, session?: ClientSession): Promise<SchoolDocument | null> {
    const school = await this.schoolModel.findById(id, null, { session }).exec();
    return school || null;
  }

  async findManyByIds(ids: string[], session?: ClientSession): Promise<SchoolDocument[]> {
    const schools = await this.schoolModel.find({ _id: { $in: ids } }, null, { session }).exec();
    return schools;
  }
}
