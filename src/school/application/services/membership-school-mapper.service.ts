import { Injectable } from '@nestjs/common';
import { MembershipEntity } from '@/school/domain/entities/membership.entity';
import { SchoolEntity } from '@/school/domain/entities/school.entity';
import { MembershipStatus, MembershipRole } from '@/school/schemas/membership.schema';

export interface SchoolWithMembershipInfo {
  id?: string; // Only returned if status is ACTIVE
  name: string;
  role: MembershipRole;
  status: MembershipStatus;
}

@Injectable()
export class MembershipSchoolMapperService {
  /**
   * Maps memberships and schools to school information with membership status
   * @param memberships Memberships of the user
   * @param schools Schools corresponding to the memberships
   * @returns Array of school information with membership status
   */
  mapMembershipsToSchools(
    memberships: MembershipEntity[],
    schools: SchoolEntity[],
  ): SchoolWithMembershipInfo[] {
    const schoolMap = new Map<string, SchoolEntity>();
    schools.forEach(school => schoolMap.set(school.id, school));

    return memberships.map((membership) => {
      const school = schoolMap.get(membership.schoolId);
      if (!school) {
        return {
          name: 'Unknown School',
          role: membership.role,
          status: membership.status,
          ...(membership.status === MembershipStatus.ACTIVE && { id: membership.schoolId }),
        };
      }

      const result: SchoolWithMembershipInfo = {
        name: school.name,
        role: membership.role,
        status: membership.status,
      };

      if (membership.status === MembershipStatus.ACTIVE) {
        result.id = school.id;
      }

      return result;
    });
  }
}
