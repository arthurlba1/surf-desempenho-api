import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { ICompetitiveRecordRepositoryPort } from '@/athlete/domain/ports/competitive-record.repository.port';
import { ISurftripRepositoryPort } from '@/athlete/domain/ports/surftrip.repository.port';
import { ISurfboardRepositoryPort } from '@/athlete/domain/ports/surfboard.repository.port';
import { IFinRepositoryPort } from '@/athlete/domain/ports/fin.repository.port';
import { IBoardSetupRepositoryPort } from '@/athlete/domain/ports/board-setup.repository.port';
import { AthleteSheetResponse } from '@/athlete/application/responses/athlete-sheet.response';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipRole, MembershipStatus } from '@/school/schemas/membership.schema';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { GetAthleteSheetQuery } from './get-athlete-sheet.query';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

function mapProfile(profile: any, user: any) {
  if (!profile && !user) return null;
  const athleteId = profile ? asId(profile) : null;
  return {
    id: athleteId ?? '',
    userId: profile?.userId ?? user?.id ?? '',
    name: user?.name,
    birthdate: user?.birthdate,
    profilePictureUrl: user?.profilePictureUrl,
    weight: profile?.weight,
    height: profile?.height,
    footSize: profile?.footSize,
    predominantStance: profile?.predominantStance,
    swimmingProficiency: profile?.swimmingProficiency,
    surfingStart: profile?.surfingStart,
    emergencyProficiency: profile?.emergencyProficiency,
    emergencyContact: profile?.emergencyContact,
    healthPlan: profile?.healthPlan,
  };
}

function mapEquipment<T extends any>(items: T[], mapper: (i: T) => any) {
  return items.map(mapper);
}

@Injectable()
export class GetAthleteSheetUseCase extends BaseUseCase<GetAthleteSheetQuery, AthleteSheetResponse> {
  constructor(
    private readonly membershipRepository: IMembershipRepositoryPort,
    private readonly userRepository: IUserRepositoryPort,
    private readonly athleteProfileRepository: IAthleteProfileRepositoryPort,
    private readonly competitiveRecordRepository: ICompetitiveRecordRepositoryPort,
    private readonly surftripRepository: ISurftripRepositoryPort,
    private readonly surfboardRepository: ISurfboardRepositoryPort,
    private readonly finRepository: IFinRepositoryPort,
    private readonly boardSetupRepository: IBoardSetupRepositoryPort,
  ) {
    super();
  }

  async handle(payload: GetAthleteSheetQuery, auth?: AuthUser): Promise<IUseCaseResponse<AthleteSheetResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');
    const isSelf = auth.id === payload.userId;
    let membershipStatus: MembershipStatus | undefined;

    if (!isSelf) {
      // Third-party access: requester must be coach/headcoach and both must be members of the requester's current school
      if (!auth.currentActiveSchoolId) {
        throw new BadRequestException('currentActiveSchoolId is required for this operation');
      }
      const schoolId = auth.currentActiveSchoolId;

      const requesterMembership = await this.membershipRepository.findByUserIdAndSchoolId(auth.id, schoolId);
      if (!requesterMembership || requesterMembership.status !== MembershipStatus.ACTIVE) {
        throw new ForbiddenException('You do not have access to this school');
      }
      if (![MembershipRole.COACH, MembershipRole.HEADCOACH].includes(requesterMembership.role)) {
        throw new ForbiddenException('Only coaches can access third-party athlete sheets');
      }

      const athleteMembership = await this.membershipRepository.findByUserIdAndSchoolId(payload.userId, schoolId);
      if (!athleteMembership || athleteMembership.role !== MembershipRole.SURFER) {
        throw new ForbiddenException('Athlete is not a surfer member of your current school');
      }
      // Note: athlete membership status is not constrained (PENDING/BLOCKED are still "members").
      membershipStatus = athleteMembership.status;
    }

    const [user, profile] = await Promise.all([
      this.userRepository.findById(payload.userId),
      this.athleteProfileRepository.findByUserId(payload.userId),
    ]);

    const [surfboards, fins, setups] = await Promise.all([
      this.surfboardRepository.listByOwnerId(payload.userId),
      this.finRepository.listByOwnerId(payload.userId),
      this.boardSetupRepository.listByOwnerId(payload.userId),
    ]);

    const athleteId = profile ? asId(profile) : null;
    const [competitiveRecords, trips] = athleteId
      ? await Promise.all([
          this.competitiveRecordRepository.listByAthleteId(athleteId),
          this.surftripRepository.listByAthleteId(athleteId),
        ])
      : [[], []];

    return this.ok(
      'Athlete sheet retrieved successfully',
      new AthleteSheetResponse(
        mapProfile(profile, user),
        competitiveRecords.map((r: any) => ({
          id: asId(r),
          athleteId: r.athleteId,
          name: r.name,
          date: r.date,
          country: r.country,
          city: r.city,
          beach: r.beach,
          peakName: r.peakName,
          responsibleAssociation: r.responsibleAssociation,
          placement: r.placement,
          prize: r.prize,
          equipments: r.equipments,
        })),
        trips.map((t: any) => ({
          id: asId(t),
          athleteId: t.athleteId,
          name: t.name,
          startDate: t.startDate,
          endDate: t.endDate,
          location: t.location,
          quiver: t.quiver,
          technicalPerformance: t.technicalPerformance,
          physicalPerformance: t.physicalPerformance,
          performance: t.performance,
          planning: t.planning,
          accumulatedSkills: t.accumulatedSkills,
          accompaniedByCoach: t.accompaniedByCoach,
        })),
        {
          surfboards: mapEquipment(surfboards, (s: any) => ({
            id: asId(s),
            ownerId: s.ownerId,
            name: s.name,
            model: s.model,
            size: s.size,
            width: s.width,
            fractionalInches: s.fractionalInches,
            thickness: s.thickness,
            volume: s.volume,
            tail: s.tail,
          })),
          fins: mapEquipment(fins, (f: any) => ({
            id: asId(f),
            ownerId: f.ownerId,
            name: f.name,
            model: f.model,
            set: f.set,
            size: f.size,
            area: f.area,
            rake: f.rake,
            base: f.base,
            height: f.height,
            foil: f.foil,
            material: f.material,
            system: f.system,
          })),
          setups: mapEquipment(setups, (b: any) => {
            const surfboard = b.surfboardId
              ? surfboards.find((sb: any) => asId(sb) === b.surfboardId)
              : null;
            const finId = b.finIds ? (b.finIds.split(',')[0]?.trim() || null) : null; // MVP: use first fin if multiple
            const fin = finId ? fins.find((f: any) => asId(f) === finId) : null;

            return {
              id: asId(b),
              ownerId: b.ownerId,
              name: b.name,
              surfboardId: b.surfboardId,
              finIds: b.finIds,
              notes: b.notes,
              surfboardName: surfboard?.name,
              finName: fin?.name,
            };
          }),
        },
        membershipStatus,
      ),
    );
  }
}
