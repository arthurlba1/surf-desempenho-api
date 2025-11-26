import { ClientSession } from 'mongoose';

import { CreateSessionDto } from '@/session/dtos/create-session.dto';
import { UpdateSessionDto } from '@/session/dtos/update-session.dto';
import { SessionDocument } from '@/session/schemas/session.schema';

export type ListSessionsFilters = {
  coachUserId?: string;
  athleteUserId?: string;
};

export abstract class ISessionRepository {
  abstract create(data: CreateSessionDto, session?: ClientSession): Promise<SessionDocument>;
  abstract findById(id: string, session?: ClientSession): Promise<SessionDocument | null>;
  abstract update(id: string, data: UpdateSessionDto, session?: ClientSession): Promise<SessionDocument | null>;
  abstract findAllBySchoolId(
    schoolId: string,
    filters?: ListSessionsFilters,
    session?: ClientSession,
  ): Promise<SessionDocument[]>;
}
