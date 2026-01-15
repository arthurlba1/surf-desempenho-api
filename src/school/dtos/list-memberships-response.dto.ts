import { Expose, plainToInstance, Type } from "class-transformer";
import { IsBoolean, IsString, ValidateNested } from "class-validator";

//import { MembershipDocument } from "@/memberships/schemas/membership.schema";

class MembershipResponseDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  profilePictureUrl?: string;
}

export class ListMembershipsResponseDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  @ValidateNested()
  @Type(() => MembershipResponseDto)
  user: MembershipResponseDto;

  @Expose()
  @IsString()
  role: string;

  @Expose()
  @IsBoolean()
  isActive: boolean;

  static fromEntity(entity: any): ListMembershipsResponseDto {
    return plainToInstance(ListMembershipsResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): ListMembershipsResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}

