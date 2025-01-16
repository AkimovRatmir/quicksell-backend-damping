import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { KaspiApiController } from './kaspiApi.controller';
import { KaspiApiService } from './kaspiApi.servise';
import { DataKaspi, DataKaspiSchema } from './dataKaspi.schema';
import { OrganizationModule } from '../organization/organization.module'; // Import OrganizationModule
import { SortedData, SortedDataSchema } from './sortedData.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: DataKaspi.name, schema: DataKaspiSchema },
      { name: SortedData.name, schema: SortedDataSchema }, // Register new schema
    ]),
    OrganizationModule,
  ],
  controllers: [KaspiApiController],
  providers: [KaspiApiService],
  exports: [KaspiApiService],
})
export class KaspiApiModule {}
