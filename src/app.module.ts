import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGlobalGuard } from '@/auth/guards/jwt-auth.global.guard';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { SessionModule } from './session/session.module';
import { SchoolModule } from './school/school.module';
import { MembershipsModule } from './memberships/memberships.module';
import { AthletesModule } from './athletes/athletes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://surfadmin:surfadmin@localhost:27017/surf-app?authSource=admin'),
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    SessionModule,
    SchoolModule,
    MembershipsModule,
    AthletesModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGlobalGuard,
    },
  ],
})
export class AppModule {}
