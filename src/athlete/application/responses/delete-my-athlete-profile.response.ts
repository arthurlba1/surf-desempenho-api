export class DeleteMyAthleteProfileResponse {
  constructor(
    public readonly deleted: boolean,
    public readonly deletedCompetitiveRecords: number,
    public readonly deletedTrips: number,
  ) {}
}
