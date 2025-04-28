import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from './organization.schema';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema }]),
  ],
  providers: [OrganizationService],
  controllers: [OrganizationController],
  exports: [OrganizationService, MongooseModule], // Export service to use in other modules
})
export class OrganizationModule {}
