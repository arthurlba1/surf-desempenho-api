import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Membership, MembershipSchema } from '@/memberships/schemas/membership.schema';
import { MembershipRepository } from '@/memberships/infrastructure/membership.repository';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Membership.name, schema: MembershipSchema }]),
  ],
  providers: [
    { provide: IMembershipRepository, useClass: MembershipRepository },
  ],
  exports: [IMembershipRepository],
})
export class MembershipsModule {}
