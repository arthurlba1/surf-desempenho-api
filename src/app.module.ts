import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGlobalGuard } from '@/auth/guards/jwt-auth.global.guard';
import { SchoolContextGuard } from '@/auth/guards/school-context.guard';
import { AuthModule } from '@/auth/auth.module';
import { IdentityModule } from '@/identity/identity.module';
import { SchoolModule } from '@/school/school.module';
import { AthleteModule } from '@/athlete/athlete.module';
import { SyncModule } from '@/sync/sync.module';

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
    IdentityModule,
    SchoolModule,
    AthleteModule,
    AuthModule,
    SyncModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGlobalGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SchoolContextGuard,
    },
  ],
})
export class AppModule {}
