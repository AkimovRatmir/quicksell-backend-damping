import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { KaspiApiController } from './kaspiApi.controller';
import { KaspiApiService } from './kaspiApi.servise';
import { DataKaspi, DataKaspiSchema } from './dataKaspi.schema';
import { OrganizationModule } from '../organization/organization.module'; // Import OrganizationModule

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: DataKaspi.name, schema: DataKaspiSchema }]),
    OrganizationModule, // Add this line to import OrganizationModule
  ],
  controllers: [KaspiApiController],
  providers: [KaspiApiService],
  exports: [KaspiApiService],
})
export class KaspiApiModule {}
