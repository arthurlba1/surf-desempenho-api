import { Injectable } from "@nestjs/common";
import { ClientSession, Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { IMembershipRepository } from "@/memberships/repositories/membership.repository.interface";
import { Membership, MembershipDocument } from "@/memberships/schemas/membership.schema";
import { CreateMembershipRelationDto } from "@/memberships/dtos/create-membership-relation.dto";


@Injectable()
export class MembershipRepository implements IMembershipRepository {
  constructor(@InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>) {}

  async create(data: CreateMembershipRelationDto, session?: ClientSession): Promise<MembershipDocument> {
    const membership = await new this.membershipModel(data).save({ session });
    return membership;
  }

  async findByUserIdAndSchoolId(userId: string, schoolId: string, session?: ClientSession): Promise<MembershipDocument | null> {
    const membership = await this.membershipModel.findOne({ userId, schoolId }, null, { session }).exec();
    return membership || null;
  }

  async findByUserId(userId: string, session?: ClientSession): Promise<MembershipDocument[]> {
    const memberships = await this.membershipModel.find({ userId }, null, { session }).exec();
    return memberships;
  }

  async findBySchoolId(schoolId: string, session?: ClientSession): Promise<any[]> {
    const pipeline = [
      { $match: { schoolId } },
      { $addFields: { userIdObj: { $toObjectId: "$userId" } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userIdObj',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          id: { $toString: '$_id' },
          role: 1,
          isActive: 1,
          user: {
            id: { $toString: '$user._id' },
            name: '$user.name',
            profilePictureUrl: '$user.profilePictureUrl',
          }
        }
      }
    ];

    const agg = this.membershipModel.aggregate(pipeline as any);
    if (session) agg.session(session);
    return await agg.exec();
  }

  async findById(id: string, session?: ClientSession): Promise<MembershipDocument | null> {
    const membership = await this.membershipModel.findById(id, null, { session }).exec();
    return membership || null;
  }

  async findByUserIdWithSchoolName(userId: string, session?: ClientSession): Promise<any[]> {
    const pipeline = [
      { $match: { userId } },
      { $addFields: { schoolIdObj: { $toObjectId: "$schoolId" } } },
      {
        $lookup: {
          from: 'schools',
          localField: 'schoolIdObj',
          foreignField: '_id',
          as: 'school'
        }
      },
      { $unwind: { path: '$school', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: 1,
          schoolId: 1,
          role: 1,
          isActive: 1,
          joinedAt: 1,
          schoolName: '$school.name',
        }
      }
    ];

    const agg = this.membershipModel.aggregate(pipeline as any);
    if (session) agg.session(session);
    return await agg.exec();
  }
}
