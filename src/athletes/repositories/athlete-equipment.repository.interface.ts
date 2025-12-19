import { AthleteEquipmentDocument } from '@/athletes/schemas/athlete-equipment.schema';
import { EquipmentType } from '@/athletes/schemas/athlete-equipment.schema';

export abstract class IAthleteEquipmentRepository {
  abstract findByAthleteId(athleteId: string): Promise<AthleteEquipmentDocument[]>;
  abstract create(data: Partial<AthleteEquipmentDocument>): Promise<AthleteEquipmentDocument>;
}

