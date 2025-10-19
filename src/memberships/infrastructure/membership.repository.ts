import { Injectable } from "@nestjs/common";
import { ClientSession, Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { ListSchoolMembersResponseDto } from "@/common/dtos/list-school-members-response.dto";
import { IMembershipRepository } from "@/memberships/repositories/membership.repository.interface";
import { Membership, MembershipDocument } from "@/memberships/schemas/membership.schema";
import { CreateMembershipRelationDto } from "@/memberships/dtos/create-membership-relation.dto";
import { MembershipResponseDto } from "@/memberships/dtos/membership-response.dto";


@Injectable()
export class MembershipRepository implements IMembershipRepository {
  constructor(@InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>) {}

  async create(data: CreateMembershipRelationDto, session?: ClientSession): Promise<MembershipResponseDto> {
    const membership = await new this.membershipModel(data).save({ session });
    return MembershipResponseDto.fromEntity(membership);
  }

  async findByUserIdAndSchoolId(userId: string, schoolId: string, session?: ClientSession): Promise<MembershipResponseDto | null> {
    const membership = await this.membershipModel.findOne({ userId, schoolId }, null, { session }).exec();
    return membership ? MembershipResponseDto.fromEntity(membership) : null;
  }

  async findByUserId(userId: string, session?: ClientSession): Promise<MembershipResponseDto[]> {
    const memberships = await this.membershipModel.find({ userId }, null, { session }).exec();
    return memberships.map(membership => MembershipResponseDto.fromEntity(membership));
  }

  async findBySchoolId(schoolId: string, session?: ClientSession): Promise<MembershipResponseDto[]> {
    const memberships = await this.membershipModel.find({ schoolId }, null, { session }).exec();
    return memberships.map(membership => MembershipResponseDto.fromEntity(membership));
  }

  async findMembersWithUserNameBySchoolId(schoolId: string, session?: ClientSession): Promise<ListSchoolMembersResponseDto[]> {
    const pipeline = [
      { $match: { schoolId } },
      {
        $lookup: {
          from: 'users',
          let: { uid: '$userId' },
          pipeline: [
            { $addFields: { _idStr: { $toString: '$_id' } } },
            { $match: { $expr: { $eq: ['$_idStr', '$$uid'] } } },
            { $project: { _id: 0, name: 1 } },
          ],
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $project: { _id: 0, userId: '$userId', name: '$user.name', role: '$role', isActive: '$isActive' } },
    ];
    const docs = await this.membershipModel.aggregate(pipeline).session(session ?? null).exec();
    return docs as ListSchoolMembersResponseDto[];
  }
}
