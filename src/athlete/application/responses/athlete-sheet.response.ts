export type AthleteProfileResponse = {
  id: string;
  userId: string;
  name?: string;
  birthdate?: string;
  profilePictureUrl?: string;
  weight?: string;
  height?: string;
  footSize?: string;
  predominantStance?: string;
  swimmingProficiency?: string;
  surfingStart?: string;
  emergencyProficiency?: string;
  emergencyContact?: string;
  healthPlan?: string;
};

export type CompetitiveRecordResponse = {
  id: string;
  athleteId: string;
  name?: string;
  date?: string;
  country?: string;
  city?: string;
  beach?: string;
  peakName?: string;
  responsibleAssociation?: string;
  placement?: string;
  prize?: string;
  equipments?: string[];
};

export type SurftripResponse = {
  id: string;
  athleteId: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  quiver?: string[];
  technicalPerformance?: string;
  physicalPerformance?: string;
  performance?: Array<{ setupId: string; performance: string }>;
  planning?: string;
  accumulatedSkills?: string;
  accompaniedByCoach?: boolean;
};

export type SurfboardResponse = {
  id: string;
  ownerId: string;
  name?: string;
  model?: string;
  size?: number;
  width?: number;
  fractionalInches?: string;
  thickness?: number;
  volume?: number;
  tail?: string;
};

export type FinResponse = {
  id: string;
  ownerId: string;
  name?: string;
  model?: string;
  set?: string;
  size?: number;
  area?: number;
  rake?: number;
  base?: number;
  height?: number;
  foil?: string;
  material?: string;
  system?: string;
};

export type BoardSetupResponse = {
  id: string;
  ownerId: string;
  name?: string;
  surfboardId?: string;
  finIds?: string;
  notes?: string;
  surfboardName?: string;
  finName?: string;
};

export class AthleteSheetResponse {
  constructor(
    public readonly profile: AthleteProfileResponse | null,
    public readonly competitiveRecords: CompetitiveRecordResponse[],
    public readonly trips: SurftripResponse[],
    public readonly equipment: {
      surfboards: SurfboardResponse[];
      fins: FinResponse[];
      setups: BoardSetupResponse[];
    },
  ) {}
}
