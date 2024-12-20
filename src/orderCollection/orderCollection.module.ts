import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderCollectionController } from './orderCollection.controller';
import { OrderCollectionService } from './orderCollection.service';
import { SortedData, SortedDataSchema } from './sortedData.schema';
import { KaspiApiModule } from '../kaspiApi/kaspiApi.module'; // Import KaspiApiModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SortedData.name, schema: SortedDataSchema }]),
    KaspiApiModule, // Add this line to import KaspiApiModule
  ],
  controllers: [OrderCollectionController],
  providers: [OrderCollectionService],
})
export class OrderCollectionModule {}

