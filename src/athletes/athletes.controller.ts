import { Controller, Get, Param } from '@nestjs/common';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/common/types/auth.types';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { ParseObjectIdPipe } from '@/common/pipes/parse-objectid.pipe';
import { ListAthletesUseCase } from '@/athletes/use-cases/list-athletes.use-case';
import { GetAthleteByIdUseCase } from '@/athletes/use-cases/get-athlete-by-id.use-case';
import { GetAthleteBodyDataUseCase } from '@/athletes/use-cases/get-athlete-body-data.use-case';
import { GetAthleteEquipmentUseCase } from '@/athletes/use-cases/get-athlete-equipment.use-case';
import { GetAthleteCompetitionsUseCase } from '@/athletes/use-cases/get-athlete-competitions.use-case';
import { GetAthleteSurftripsUseCase } from '@/athletes/use-cases/get-athlete-surftrips.use-case';
import { AthleteResponseDto } from '@/athletes/dtos/athlete-response.dto';
import { AthleteBodyDataResponseDto } from '@/athletes/dtos/athlete-body-data-response.dto';
import { AthleteEquipmentResponseDto } from '@/athletes/dtos/athlete-equipment-response.dto';
import { AthleteCompetitionResponseDto } from '@/athletes/dtos/athlete-competition-response.dto';
import { AthleteSurftripResponseDto } from '@/athletes/dtos/athlete-surftrip-response.dto';

@Controller('athletes')
export class AthletesController {
  constructor(
    private readonly listAthletesUseCase: ListAthletesUseCase,
    private readonly getAthleteByIdUseCase: GetAthleteByIdUseCase,
    private readonly getAthleteBodyDataUseCase: GetAthleteBodyDataUseCase,
    private readonly getAthleteEquipmentUseCase: GetAthleteEquipmentUseCase,
    private readonly getAthleteCompetitionsUseCase: GetAthleteCompetitionsUseCase,
    private readonly getAthleteSurftripsUseCase: GetAthleteSurftripsUseCase,
  ) {}

  @Get()
  async findAll(@CurrentUser() auth: AuthUser): Promise<ApiResponseDto<AthleteResponseDto[]>> {
    return await this.listAthletesUseCase.handle(undefined, auth);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() auth: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<ApiResponseDto<AthleteResponseDto>> {
    return await this.getAthleteByIdUseCase.handle({ id }, auth);
  }

  @Get(':id/body-data')
  async getBodyData(
    @CurrentUser() auth: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<ApiResponseDto<AthleteBodyDataResponseDto>> {
    return await this.getAthleteBodyDataUseCase.handle({ id }, auth);
  }

  @Get(':id/equipment')
  async getEquipment(
    @CurrentUser() auth: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<ApiResponseDto<{ [key: string]: AthleteEquipmentResponseDto[] }>> {
    return await this.getAthleteEquipmentUseCase.handle({ id }, auth);
  }

  @Get(':id/competitions')
  async getCompetitions(
    @CurrentUser() auth: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<ApiResponseDto<AthleteCompetitionResponseDto[]>> {
    return await this.getAthleteCompetitionsUseCase.handle({ id }, auth);
  }

  @Get(':id/surftrips')
  async getSurftrips(
    @CurrentUser() auth: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<ApiResponseDto<AthleteSurftripResponseDto[]>> {
    return await this.getAthleteSurftripsUseCase.handle({ id }, auth);
  }
}

