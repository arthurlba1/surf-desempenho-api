export class AthleteEvaluationEntity {
  constructor(
    public readonly id: string,
    public readonly trainingSessionId: string,
    public readonly schoolId: string,
    public readonly athleteId: string,
    public perceivedFluidity?: string,
    public perceivedSpeed?: string,
    public power?: string,
    public varietyOfManeuvers?: string,
    public combinationOfManeuvers?: string,
    public completionRate?: number,
    public commitment?: string,
    public overallTrainingVolume?: string,
    public adherenceToProposal?: string,
    public motivation?: string,
    public nps?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static fromDocument(document: any): AthleteEvaluationEntity {
    return new AthleteEvaluationEntity(
      document._id?.toString() || document.id,
      document.trainingSessionId,
      document.schoolId,
      document.athleteId,
      document.perceivedFluidity,
      document.perceivedSpeed,
      document.power,
      document.varietyOfManeuvers,
      document.combinationOfManeuvers,
      document.completionRate,
      document.commitment,
      document.overallTrainingVolume,
      document.adherenceToProposal,
      document.motivation,
      document.nps,
      document.createdAt,
      document.updatedAt,
    );
  }
}
