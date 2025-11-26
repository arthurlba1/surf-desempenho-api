import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { ISessionRepository, ListSessionsFilters } from '@/session/repositories/session.repository.interface';
import { Session, SessionDocument } from '@/session/schemas/session.schema';
import { CreateSessionDto } from '@/session/dtos/create-session.dto';
import { UpdateSessionDto } from '@/session/dtos/update-session.dto';
import { buildGetSessionByIdPipeline } from '@/session/infrastructure/pipelines/get-session-by-id.pipeline';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(@InjectModel(Session.name) private sessionModel: Model<SessionDocument>) {}
  
  async findById(id: string, session?: ClientSession): Promise<SessionDocument | null> {
    const aggregation = this.sessionModel.aggregate(buildGetSessionByIdPipeline(id));
    if (session) aggregation.session(session);

    const [result] = await aggregation.exec();
    if (!result) return null;

    return this.sessionModel.hydrate(result);
  }

  async create(data: CreateSessionDto, session?: ClientSession): Promise<SessionDocument>  {
    const sessionDoc = await new this.sessionModel(data).save({ session });
    return sessionDoc;
  }

  async update(id: string, data: UpdateSessionDto, session?: ClientSession): Promise<SessionDocument | null> {
    await this.sessionModel.findByIdAndUpdate(id, data, { new: true, session }).exec();

    return await this.findById(id, session)
  }

  async findAllBySchoolId(
    schoolId: string,
    filters?: ListSessionsFilters,
    session?: ClientSession,
  ): Promise<SessionDocument[]> {
    const filter: Record<string, any> = { schoolId };
    if (filters?.coachUserId) {
      filter['coach.userId'] = filters.coachUserId;
    }
    if (filters?.athleteUserId) {
      filter['athletes.userId'] = filters.athleteUserId;
    }

    const query = this.sessionModel.find(filter, null, { session }).sort({ createdAt: -1 });
    return await query.exec();
  }
}
