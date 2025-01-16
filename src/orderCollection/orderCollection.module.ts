import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderCollectionController } from './orderCollection.controller';
import { OrderCollectionService } from './orderCollection.service';
import { SortedData, SortedDataSchema } from './sortedData.schemaa';
import { DataKaspi, DataKaspiSchema } from '../kaspiApi/dataKaspi.schema'; // Import DataKaspi schema
import { KaspiApiModule } from '../kaspiApi/kaspiApi.module'; // Import KaspiApiModule

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SortedData.name, schema: SortedDataSchema },
      { name: DataKaspi.name, schema: DataKaspiSchema }, // Add this line
    ]),
    KaspiApiModule, // Ensure KaspiApiModule is imported
  ],
  controllers: [OrderCollectionController],
  providers: [OrderCollectionService],
})
export class OrderCollectionModule {}


