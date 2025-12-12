import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { AppModule } from '@/app.module';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { ISchoolRepository } from '@/school/repositories/school.repository.interface';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';
import { CreateUserDto } from '@/users/dtos/create-user.dto';
import { RegisterSchoolDto } from '@/school/dtos/register-school.dto';
import { CreateMembershipRelationDto } from '@/memberships/dtos/create-membership-relation.dto';
import { MembershipRole } from '@/memberships/schemas/membership.schema';
import { UserRole } from '@/users/types/user-role.type';
import { CreateSessionDto } from '@/session/dtos/create-session.dto';

async function createMany<T>(count: number, creator: (index: number) => Promise<T>): Promise<T[]> {
  const results: T[] = [];
  for (let i = 1; i <= count; i++) {
    results.push(await creator(i));
  }
  return results;
}

async function clearCollections(connection: Connection): Promise<void> {
  const collections = ['users', 'schools', 'memberships', 'sessions'];
  for (const name of collections) {
    try {
      await connection.collection(name).deleteMany({});
      console.log(`Cleared collection: ${name}`);
    } catch (err) {
      console.warn(`Skip clearing ${name}:`, err?.message ?? err);
    }
  }
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  try {
    const connection = app.get<Connection>(getConnectionToken());
    await clearCollections(connection);

    const userRepo = app.get(IUserRepository);
    const schoolRepo = app.get(ISchoolRepository);
    const membershipRepo = app.get(IMembershipRepository);
    const sessionRepo = app.get(ISessionRepository);

    const headCoachPassword = await bcrypt.hash('headcoach123', 10);
    const headCoach = await userRepo.create({
      name: 'John Doe HeadCoach',
      email: 'john_doe_headcoach@email.com',
      password: headCoachPassword,
      role: UserRole.HEADCOACH,
      profilePictureUrl: '',
      birthdate: '',
      document: '111111111',
    } as CreateUserDto);

    const headCoachSchool = await schoolRepo.create({
      name: "John Doe HeadCoach's School",
      owner: headCoach.id,
      onHold: false,
    } as RegisterSchoolDto);

    await membershipRepo.create({
      userId: headCoach.id,
      schoolId: headCoachSchool.id,
      role: MembershipRole.HEADCOACH,
    } as CreateMembershipRelationDto);

    await userRepo.setCurrentActiveSchoolId(headCoach.id, headCoachSchool.id);
    // active schools now derived from memberships; no user update needed

    const extraCoaches = await createMany(3, async (index) => {
      const password = await bcrypt.hash(`johndoe${index}`, 10);
      const coach = await userRepo.create({
        name: `John Doe Coach ${index}`,
        email: `john_doe_coach_${index}@email.com`,
        password,
        role: UserRole.COACH,
        profilePictureUrl: '',
        birthdate: '',
        document: `123456789${index}`,
      } as CreateUserDto);

      const extraCoachSchool = await schoolRepo.create({
        name: `${coach.name}'s School`,
        owner: coach.id,
        onHold: true,
      } as RegisterSchoolDto);

      await membershipRepo.create({
        userId: coach.id,
        schoolId: extraCoachSchool.id,
        role: MembershipRole.COACH,
      } as CreateMembershipRelationDto);

      await membershipRepo.create({
        userId: coach.id,
        schoolId: headCoachSchool.id,
        role: MembershipRole.COACH,
      } as CreateMembershipRelationDto);

      await userRepo.setCurrentActiveSchoolId(coach.id, headCoachSchool.id);
      return coach;
    });


    const soloCoachPassword = await bcrypt.hash('johndoe4', 10);
    const soloCoach = await userRepo.create({
      name: 'John Doe Coach 4',
      email: 'john_doe_coach_4@email.com',
      password: soloCoachPassword,
      role: UserRole.COACH,
      profilePictureUrl: '',
      birthdate: '',
      document: '1234567894',
    } as CreateUserDto);

    const soloCoachSchool = await schoolRepo.create({
      name: "John Doe Coach 4's School",
      owner: soloCoach.id,
      onHold: true,
    } as RegisterSchoolDto);

    await membershipRepo.create({
      userId: soloCoach.id,
      schoolId: soloCoachSchool.id,
      role: MembershipRole.COACH,
    } as CreateMembershipRelationDto);

    await userRepo.setCurrentActiveSchoolId(soloCoach.id, soloCoachSchool.id);
    // active schools now derived from memberships; no user update needed

    // Create surfers: 10 total (1 principal without index + 9 indexed), all in headCoach school
    const principalSurferPassword = await bcrypt.hash('doe123', 10);
    const principalSurfer = await userRepo.create({
      name: 'John Doe Surfer',
      email: 'john_doe_surfer@email.com',
      password: principalSurferPassword,
      role: UserRole.SURFER,
      profilePictureUrl: '',
      birthdate: '',
      document: '987654321',
    } as CreateUserDto);

    await membershipRepo.create({
      userId: principalSurfer.id,
      schoolId: headCoachSchool.id,
      role: MembershipRole.SURFER,
    } as CreateMembershipRelationDto);

    await userRepo.setCurrentActiveSchoolId(principalSurfer.id, headCoachSchool.id);
    // active schools now derived from memberships; no user update needed

    await createMany(9, async (index) => {
      const password = await bcrypt.hash('doe123', 10);
      const surfer = await userRepo.create({
        name: `John Doe Surfer ${index}`,
        email: `john_doe_surfer_${index}@email.com`,
        password,
        role: UserRole.SURFER,
        profilePictureUrl: '',
        birthdate: '',
        document: `987654321${index}`,
      } as CreateUserDto);

      await membershipRepo.create({
        userId: surfer.id,
        schoolId: headCoachSchool.id,
        role: MembershipRole.SURFER,
      } as CreateMembershipRelationDto);

      await userRepo.setCurrentActiveSchoolId(surfer.id, headCoachSchool.id);
      // active schools now derived from memberships; no user update needed

      return surfer;
    });

    // Create an empty session in headCoach school by a secondary coach
    const secondaryCoach = extraCoaches[0];
    await sessionRepo.create({
      schoolId: headCoachSchool.id,
      inProgress: false,
      duration: 0,
      totalDuration: 0,
      coach: { userId: secondaryCoach.id, name: secondaryCoach.name },
      athletes: [],
    } as CreateSessionDto);

    console.log('Seeding completed successfully');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

seed();
