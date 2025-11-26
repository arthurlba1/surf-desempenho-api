import { Expose, plainToInstance } from "class-transformer";

import { Membership, MembershipRole } from "../schemas/membership.schema";

export class MembershipResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  schoolId: string;

  @Expose()
  role: MembershipRole;

  @Expose()
  isActive: boolean;

  @Expose()
  schoolName: string;

  @Expose()
  joinedAt: Date;

  static fromEntity(entity: Membership): MembershipResponseDto {
    return plainToInstance(MembershipResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: Membership[]): MembershipResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}
