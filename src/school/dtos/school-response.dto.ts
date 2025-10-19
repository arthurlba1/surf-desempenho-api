import { plainToInstance } from "class-transformer";
import { Expose } from "class-transformer";

import { School } from "@/school/schemas/school.schema";

export class SchoolResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  owner: string;

  @Expose()
  onHold: boolean;

  static fromEntity(entity: School): SchoolResponseDto {
    return plainToInstance(SchoolResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: School[]): SchoolResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}
