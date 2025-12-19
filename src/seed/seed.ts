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
import { IAthleteBodyDataRepository } from '@/athletes/repositories/athlete-body-data.repository.interface';
import { IAthleteEquipmentRepository } from '@/athletes/repositories/athlete-equipment.repository.interface';
import { IAthleteCompetitionRepository } from '@/athletes/repositories/athlete-competition.repository.interface';
import { IAthleteSurftripRepository } from '@/athletes/repositories/athlete-surftrip.repository.interface';
import { EquipmentType } from '@/athletes/schemas/athlete-equipment.schema';

async function createMany<T>(count: number, creator: (index: number) => Promise<T>): Promise<T[]> {
  const results: T[] = [];
  for (let i = 1; i <= count; i++) {
    results.push(await creator(i));
  }
  return results;
}

async function clearCollections(connection: Connection): Promise<void> {
  const collections = ['users', 'schools', 'memberships', 'sessions', 'athletebodydatas', 'athleteequipments', 'athletecompetitions', 'athletesurftrips'];
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
    const bodyDataRepo = app.get(IAthleteBodyDataRepository);
    const equipmentRepo = app.get(IAthleteEquipmentRepository);
    const competitionRepo = app.get(IAthleteCompetitionRepository);
    const surftripRepo = app.get(IAthleteSurftripRepository);

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

    // Helper function to generate avatar URL
    const getAvatarUrl = (name: string): string => {
      const encodedName = encodeURIComponent(name);
      return `https://ui-avatars.com/api/?name=${encodedName}&size=200&background=random&color=fff&bold=true`;
    };

    // Helper function to generate a random birthdate (between 18 and 35 years ago)
    const getRandomBirthdate = (): string => {
      const yearsAgo = 18 + Math.floor(Math.random() * 17); // 18-35 years old
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const year = new Date().getFullYear() - yearsAgo;
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };

    // Create surfers: 10 total (1 principal without index + 9 indexed), all in headCoach school
    const principalSurferPassword = await bcrypt.hash('doe123', 10);
    const principalSurfer = await userRepo.create({
      name: 'John Doe Surfer',
      email: 'john_doe_surfer@email.com',
      password: principalSurferPassword,
      role: UserRole.SURFER,
      profilePictureUrl: getAvatarUrl('John Doe Surfer'),
      birthdate: getRandomBirthdate(),
      document: '987654321',
    } as CreateUserDto);

    await membershipRepo.create({
      userId: principalSurfer.id,
      schoolId: headCoachSchool.id,
      role: MembershipRole.SURFER,
    } as CreateMembershipRelationDto);

    await userRepo.setCurrentActiveSchoolId(principalSurfer.id, headCoachSchool.id);
    // active schools now derived from memberships; no user update needed

    const allSurfers = [principalSurfer];
    const additionalSurfers = await createMany(9, async (index) => {
      const password = await bcrypt.hash('doe123', 10);
      const surferName = `John Doe Surfer ${index}`;
      const surfer = await userRepo.create({
        name: surferName,
        email: `john_doe_surfer_${index}@email.com`,
        password,
        role: UserRole.SURFER,
        profilePictureUrl: getAvatarUrl(surferName),
        birthdate: getRandomBirthdate(),
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

    allSurfers.push(...additionalSurfers);

    // Create athlete data (body data, equipment, competitions, surftrips)
    for (let i = 0; i < allSurfers.length; i++) {
      const surfer = allSurfers[i];
      
      // Create body data
      await bodyDataRepo.create({
        athleteId: surfer.id,
        weight: `${70 + Math.floor(Math.random() * 15)} kg`,
        height: `${1.70 + (Math.random() * 0.15).toFixed(2)} m`,
        footSize: `${40 + Math.floor(Math.random() * 5)}`,
        predominantStance: Math.random() > 0.5 ? 'Regular' : 'Goofy',
        swimmingProficiency: ['Iniciante', 'Intermediário', 'Avançado'][Math.floor(Math.random() * 3)],
        surfingStart: `${2015 + Math.floor(Math.random() * 9)}`,
        emergencyProficiency: ['Básico', 'Intermediário', 'Avançado'][Math.floor(Math.random() * 3)],
        emergencyContact: `+55 11 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        healthPlan: ['Unimed', 'SulAmérica', 'Bradesco Saúde', 'NotreDame'][Math.floor(Math.random() * 4)],
      });

      // Create equipment
      const equipmentTypes = [
        { type: EquipmentType.CPQ, items: [
          { name: 'Rip Curl Dawn Patrol 3/2', description: 'Wetsuit para água fria', date: '2024-01-15' },
          { name: 'Quiksilver Syncro 2/2', description: 'Wetsuit para água morna', date: '2023-08-20' },
        ]},
        { type: EquipmentType.BOARDS, items: [
          { name: 'Lost Puddle Jumper 5\'8"', description: 'Shortboard para ondas pequenas a médias', date: '2024-03-10' },
          { name: 'Pyzel Shadow 6\'0"', description: 'Performance shortboard', date: '2023-11-05' },
          { name: 'Firewire Seaside 5\'10"', description: 'Hybrid board versátil', date: '2023-06-15' },
        ]},
        { type: EquipmentType.FINS, items: [
          { name: 'FCS II Performance', description: 'Set de 3 quilhas para performance', date: '2024-02-01' },
          { name: 'Futures Blackstix', description: 'Quilhas para ondas grandes', date: '2023-09-12' },
        ]},
      ];

      for (const eqType of equipmentTypes) {
        for (const item of eqType.items) {
          await equipmentRepo.create({
            athleteId: surfer.id,
            type: eqType.type,
            name: item.name,
            description: item.description,
            date: item.date,
          });
        }
      }

      // Create competitions
      const competitions = [
        { name: 'Circuito Brasileiro de Surf 2024', date: '2024-05-15', location: 'Praia de Itacaré, BA', association: 'ABRASURF', placement: `${Math.floor(Math.random() * 10) + 1}º lugar`, prize: `R$ ${(Math.random() * 5000 + 1000).toFixed(2)}`, equipment: 'Lost Puddle Jumper 5\'8"' },
        { name: 'Campeonato Estadual de São Paulo', date: '2024-03-20', location: 'Praia de Maresias, SP', association: 'FESURF', placement: `${Math.floor(Math.random() * 10) + 1}º lugar`, prize: `R$ ${(Math.random() * 5000 + 1000).toFixed(2)}`, equipment: 'Pyzel Shadow 6\'0"' },
        { name: 'WSL Qualifying Series', date: '2023-11-10', location: 'Praia de Ubatuba, SP', association: 'WSL', placement: `${Math.floor(Math.random() * 10) + 1}º lugar`, prize: `R$ ${(Math.random() * 5000 + 1000).toFixed(2)}`, equipment: 'Firewire Seaside 5\'10"' },
      ];

      for (const comp of competitions) {
        await competitionRepo.create({
          athleteId: surfer.id,
          ...comp,
        });
      }

      // Create surftrips
      const surftrips = [
        {
          name: 'Surftrip Bali 2024',
          dateStart: '2024-07-01',
          dateEnd: '2024-07-15',
          location: 'Bali, Indonésia',
          quiver: ['Lost Puddle Jumper 5\'8"', 'Pyzel Shadow 6\'0"'],
          physicalPerformance: 'Excelente condicionamento físico, aguentou sessões longas',
          technicalPerformance: 'Melhorou muito nas manobras aéreas e cutbacks',
          equipmentPerformance: ['Lost Puddle Jumper funcionou perfeitamente em ondas pequenas', 'Pyzel Shadow excelente para ondas maiores'],
          planning: 'Foco em ondas de reef e beach breaks',
          accumulatedCompetencies: 'Aprendeu novas técnicas de leitura de onda e posicionamento',
          coachFollowUp: 'Atleta mostrou grande evolução técnica durante a viagem',
        },
        {
          name: 'Surftrip Havaí 2023',
          dateStart: '2023-12-10',
          dateEnd: '2023-12-25',
          location: 'North Shore, Havaí',
          quiver: ['Firewire Seaside 5\'10"', 'Pyzel Shadow 6\'0"'],
          physicalPerformance: 'Bom condicionamento, mas precisou se adaptar às ondas grandes',
          technicalPerformance: 'Focou em drop-ins e bottom turns em ondas grandes',
          equipmentPerformance: ['Firewire Seaside versátil em diferentes condições', 'Pyzel Shadow ideal para ondas grandes'],
          planning: 'Treinamento em ondas grandes e técnicas de segurança',
          accumulatedCompetencies: 'Ganhou experiência em ondas grandes e leitura de swell',
          coachFollowUp: 'Atleta demonstrou coragem e progresso constante',
        },
      ];

      for (const trip of surftrips) {
        await surftripRepo.create({
          athleteId: surfer.id,
          ...trip,
        });
      }
    }

    // Create sessions with athletes for history
    const secondaryCoach = extraCoaches[0];
    
    // Create sessions with individual athletes (one per athlete)
    for (let i = 0; i < Math.min(4, allSurfers.length); i++) {
      const surfer = allSurfers[i];
      
      // Create session with this athlete
      await sessionRepo.create({
        schoolId: headCoachSchool.id,
        inProgress: false,
        duration: 60 + Math.floor(Math.random() * 120), // 60-180 minutes
        totalDuration: 60 + Math.floor(Math.random() * 120),
        coach: { userId: secondaryCoach.id, name: secondaryCoach.name },
        athletes: [
          { userId: surfer.id, name: surfer.name }
        ],
      } as CreateSessionDto);
    }

    // Create a session with multiple athletes (3-5 athletes)
    const multipleAthletesSession = allSurfers.slice(0, Math.min(5, allSurfers.length));
    await sessionRepo.create({
      schoolId: headCoachSchool.id,
      inProgress: false,
      duration: 120,
      totalDuration: 120,
      coach: { userId: secondaryCoach.id, name: secondaryCoach.name },
      athletes: multipleAthletesSession.map(surfer => ({
        userId: surfer.id,
        name: surfer.name
      })),
    } as CreateSessionDto);

    // Create an empty session in headCoach school by a secondary coach
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
