import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/common/types/auth.types';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { GetAthleteSheetUseCase } from '@/athlete/application/queries/get-athlete-sheet.use-case';
import { AthleteSheetResponse } from '@/athlete/application/responses/athlete-sheet.response';
import { GetAthleteSheetQuery } from '@/athlete/application/queries/get-athlete-sheet.query';
import { GetMyAthleteProfileUseCase } from '@/athlete/application/queries/get-my-athlete-profile.use-case';
import { AthleteProfileResponse } from '@/athlete/application/responses/athlete-profile.response';
import { UpsertMyAthleteProfileCommand } from '@/athlete/application/commands/upsert-my-athlete-profile.command';
import { UpsertMyAthleteProfileUseCase } from '@/athlete/application/commands/upsert-my-athlete-profile.use-case';
import { DeleteMyAthleteProfileUseCase } from '@/athlete/application/commands/delete-my-athlete-profile.use-case';
import { DeleteMyAthleteProfileResponse } from '@/athlete/application/responses/delete-my-athlete-profile.response';
import { CreateMyCompetitiveRecordCommand } from '@/athlete/application/commands/create-my-competitive-record.command';
import { CreateMyCompetitiveRecordUseCase } from '@/athlete/application/commands/create-my-competitive-record.use-case';
import { UpdateMyCompetitiveRecordCommand } from '@/athlete/application/commands/update-my-competitive-record.command';
import { UpdateMyCompetitiveRecordUseCase } from '@/athlete/application/commands/update-my-competitive-record.use-case';
import { DeleteMyCompetitiveRecordUseCase } from '@/athlete/application/commands/delete-my-competitive-record.use-case';
import { DeleteMyCompetitiveRecordResponse } from '@/athlete/application/responses/delete-my-competitive-record.response';
import { CreateMySurftripCommand } from '@/athlete/application/commands/create-my-surftrip.command';
import { CreateMySurftripUseCase } from '@/athlete/application/commands/create-my-surftrip.use-case';
import { UpdateMySurftripCommand } from '@/athlete/application/commands/update-my-surftrip.command';
import { UpdateMySurftripUseCase } from '@/athlete/application/commands/update-my-surftrip.use-case';
import { DeleteMySurftripUseCase } from '@/athlete/application/commands/delete-my-surftrip.use-case';
import { DeleteMySurftripResponse } from '@/athlete/application/responses/delete-my-surftrip.response';
import { CreateMySurfboardCommand } from '@/athlete/application/commands/create-my-surfboard.command';
import { CreateMySurfboardUseCase } from '@/athlete/application/commands/create-my-surfboard.use-case';
import { UpdateMySurfboardCommand } from '@/athlete/application/commands/update-my-surfboard.command';
import { UpdateMySurfboardUseCase } from '@/athlete/application/commands/update-my-surfboard.use-case';
import { DeleteMySurfboardUseCase } from '@/athlete/application/commands/delete-my-surfboard.use-case';
import { DeleteMySurfboardResponse } from '@/athlete/application/responses/delete-my-surfboard.response';
import { CreateMyFinCommand } from '@/athlete/application/commands/create-my-fin.command';
import { CreateMyFinUseCase } from '@/athlete/application/commands/create-my-fin.use-case';
import { UpdateMyFinCommand } from '@/athlete/application/commands/update-my-fin.command';
import { UpdateMyFinUseCase } from '@/athlete/application/commands/update-my-fin.use-case';
import { DeleteMyFinUseCase } from '@/athlete/application/commands/delete-my-fin.use-case';
import { DeleteMyFinResponse } from '@/athlete/application/responses/delete-my-fin.response';
import { CreateMyBoardSetupCommand } from '@/athlete/application/commands/create-my-board-setup.command';
import { CreateMyBoardSetupUseCase } from '@/athlete/application/commands/create-my-board-setup.use-case';
import { UpdateMyBoardSetupCommand } from '@/athlete/application/commands/update-my-board-setup.command';
import { UpdateMyBoardSetupUseCase } from '@/athlete/application/commands/update-my-board-setup.use-case';
import { DeleteMyBoardSetupUseCase } from '@/athlete/application/commands/delete-my-board-setup.use-case';
import { DeleteMyBoardSetupResponse } from '@/athlete/application/responses/delete-my-board-setup.response';

@Controller('athlete')
export class AthleteController {
  constructor(
    private readonly getAthleteSheetUseCase: GetAthleteSheetUseCase,
    private readonly getMyAthleteProfileUseCase: GetMyAthleteProfileUseCase,
    private readonly upsertMyAthleteProfileUseCase: UpsertMyAthleteProfileUseCase,
    private readonly deleteMyAthleteProfileUseCase: DeleteMyAthleteProfileUseCase,
    private readonly createMyCompetitiveRecordUseCase: CreateMyCompetitiveRecordUseCase,
    private readonly updateMyCompetitiveRecordUseCase: UpdateMyCompetitiveRecordUseCase,
    private readonly deleteMyCompetitiveRecordUseCase: DeleteMyCompetitiveRecordUseCase,
    private readonly createMySurftripUseCase: CreateMySurftripUseCase,
    private readonly updateMySurftripUseCase: UpdateMySurftripUseCase,
    private readonly deleteMySurftripUseCase: DeleteMySurftripUseCase,
    private readonly createMySurfboardUseCase: CreateMySurfboardUseCase,
    private readonly updateMySurfboardUseCase: UpdateMySurfboardUseCase,
    private readonly deleteMySurfboardUseCase: DeleteMySurfboardUseCase,
    private readonly createMyFinUseCase: CreateMyFinUseCase,
    private readonly updateMyFinUseCase: UpdateMyFinUseCase,
    private readonly deleteMyFinUseCase: DeleteMyFinUseCase,
    private readonly createMyBoardSetupUseCase: CreateMyBoardSetupUseCase,
    private readonly updateMyBoardSetupUseCase: UpdateMyBoardSetupUseCase,
    private readonly deleteMyBoardSetupUseCase: DeleteMyBoardSetupUseCase,
  ) {}

  @Get('users/:userId/sheet')
  async getAthleteSheet(
    @Param('userId') userId: string,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<AthleteSheetResponse>> {
    return await this.getAthleteSheetUseCase.handle({ userId } as GetAthleteSheetQuery, auth);
  }

  @Get('me/profile')
  async getMyProfile(@CurrentUser() auth: AuthUser): Promise<ApiResponseDto<AthleteProfileResponse>> {
    return await this.getMyAthleteProfileUseCase.handle({}, auth);
  }

  @Patch('me/profile')
  async upsertMyProfile(
    @Body() command: UpsertMyAthleteProfileCommand,
    @CurrentUser() auth: AuthUser,
  ) {
    return await this.upsertMyAthleteProfileUseCase.handle(command, auth);
  }

  @Delete('me/profile')
  async deleteMyProfile(@CurrentUser() auth: AuthUser): Promise<ApiResponseDto<DeleteMyAthleteProfileResponse>> {
    return await this.deleteMyAthleteProfileUseCase.handle({}, auth);
  }

  @Post('me/competitive-records')
  async createMyCompetitiveRecord(
    @Body() command: CreateMyCompetitiveRecordCommand,
    @CurrentUser() auth: AuthUser,
  ) {
    return await this.createMyCompetitiveRecordUseCase.handle(command, auth);
  }

  @Patch('me/competitive-records/:id')
  async updateMyCompetitiveRecord(
    @Param('id') id: string,
    @Body() command: UpdateMyCompetitiveRecordCommand,
    @CurrentUser() auth: AuthUser,
  ) {
    return await this.updateMyCompetitiveRecordUseCase.handle({ ...command, id } as any, auth);
  }

  @Delete('me/competitive-records/:id')
  async deleteMyCompetitiveRecord(
    @Param('id') id: string,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<DeleteMyCompetitiveRecordResponse>> {
    return await this.deleteMyCompetitiveRecordUseCase.handle({ id } as any, auth);
  }

  @Post('me/trips')
  async createMyTrip(@Body() command: CreateMySurftripCommand, @CurrentUser() auth: AuthUser) {
    return await this.createMySurftripUseCase.handle(command, auth);
  }

  @Patch('me/trips/:id')
  async updateMyTrip(
    @Param('id') id: string,
    @Body() command: UpdateMySurftripCommand,
    @CurrentUser() auth: AuthUser,
  ) {
    return await this.updateMySurftripUseCase.handle({ ...command, id } as any, auth);
  }

  @Delete('me/trips/:id')
  async deleteMyTrip(
    @Param('id') id: string,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<DeleteMySurftripResponse>> {
    return await this.deleteMySurftripUseCase.handle({ id } as any, auth);
  }

  @Post('me/equipment/surfboards')
  async createMySurfboard(@Body() command: CreateMySurfboardCommand, @CurrentUser() auth: AuthUser) {
    return await this.createMySurfboardUseCase.handle(command, auth);
  }

  @Patch('me/equipment/surfboards/:id')
  async updateMySurfboard(
    @Param('id') id: string,
    @Body() command: UpdateMySurfboardCommand,
    @CurrentUser() auth: AuthUser,
  ) {
    return await this.updateMySurfboardUseCase.handle({ ...command, id } as any, auth);
  }

  @Delete('me/equipment/surfboards/:id')
  async deleteMySurfboard(
    @Param('id') id: string,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<DeleteMySurfboardResponse>> {
    return await this.deleteMySurfboardUseCase.handle({ id } as any, auth);
  }

  @Post('me/equipment/fins')
  async createMyFin(@Body() command: CreateMyFinCommand, @CurrentUser() auth: AuthUser) {
    return await this.createMyFinUseCase.handle(command, auth);
  }

  @Patch('me/equipment/fins/:id')
  async updateMyFin(
    @Param('id') id: string,
    @Body() command: UpdateMyFinCommand,
    @CurrentUser() auth: AuthUser,
  ) {
    return await this.updateMyFinUseCase.handle({ ...command, id } as any, auth);
  }

  @Delete('me/equipment/fins/:id')
  async deleteMyFin(
    @Param('id') id: string,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<DeleteMyFinResponse>> {
    return await this.deleteMyFinUseCase.handle({ id } as any, auth);
  }

  @Post('me/equipment/setups')
  async createMySetup(@Body() command: CreateMyBoardSetupCommand, @CurrentUser() auth: AuthUser) {
    return await this.createMyBoardSetupUseCase.handle(command, auth);
  }

  @Patch('me/equipment/setups/:id')
  async updateMySetup(
    @Param('id') id: string,
    @Body() command: UpdateMyBoardSetupCommand,
    @CurrentUser() auth: AuthUser,
  ) {
    return await this.updateMyBoardSetupUseCase.handle({ ...command, id } as any, auth);
  }

  @Delete('me/equipment/setups/:id')
  async deleteMySetup(
    @Param('id') id: string,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<DeleteMyBoardSetupResponse>> {
    return await this.deleteMyBoardSetupUseCase.handle({ id } as any, auth);
  }
}
