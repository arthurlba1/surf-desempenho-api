export type SetupEvaluationSource = 'coach' | 'self';

export class SetupEvaluationEntity {
  constructor(
    public readonly id: string,
    public readonly trainingSessionId: string,
    public readonly schoolId: string,
    public readonly athleteId: string,
    public readonly setupId: string,
    public cruisingSpeed?: string,
    public attackSpeed?: string,
    public submergedSpeed?: string,
    public overallBoardFlow?: string,
    public perceivedSpeed?: string,
    public maneuverability?: string,
    public control?: string,
    public nps?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public source?: SetupEvaluationSource,
  ) {}

  static fromDocument(document: any): SetupEvaluationEntity {
    return new SetupEvaluationEntity(
      document._id?.toString() || document.id,
      document.trainingSessionId,
      document.schoolId,
      document.athleteId,
      document.setupId,
      document.cruisingSpeed,
      document.attackSpeed,
      document.submergedSpeed,
      document.overallBoardFlow,
      document.perceivedSpeed,
      document.maneuverability,
      document.control,
      document.nps,
      document.createdAt,
      document.updatedAt,
      document.source ?? 'coach',
    );
  }
}
