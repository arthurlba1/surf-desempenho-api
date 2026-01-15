export type SchoolAthletesStatusFilter = 'ACTIVE' | 'PENDING' | 'BLOCKED' | 'INACTIVE' | 'ALL';

export class GetSchoolAthletesQuery {
  status?: SchoolAthletesStatusFilter;
}
