import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { KaspiApiController } from './kaspiApi.controller';
import { KaspiApiService } from './kaspiApi.servise';
import { DataKaspi, DataKaspiSchema } from './schemas/dataKaspi.schema';
import { SortedData, SortedDataSchema } from './schemas/sortedData.schema';
import { ArchiveKaspi, ArchiveKaspiSchema } from './schemas/archiveKaspi.schema'; // ✅ NEW
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    HttpModule,
    OrganizationModule,
    MongooseModule.forFeature([
      { name: DataKaspi.name, schema: DataKaspiSchema },
      { name: SortedData.name, schema: SortedDataSchema },
      { name: ArchiveKaspi.name, schema: ArchiveKaspiSchema }, // ✅ REGISTERED
    ]),
  ],
  controllers: [KaspiApiController],
  providers: [KaspiApiService],
  exports: [KaspiApiService],
})
export class KaspiApiModule {}
