import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KaspiService } from './kaspi/kaspi.service';
import { KaspiController } from './kaspi/kaspi.controller';
import { ExcelModule } from './excelInt/exel.module';
import { AuthModule } from './auth/auth.module';
import { KaspiApiModule } from './kaspiApi/kaspiApi.module';
import { OrganizationModule } from './organization/organization.module'; // Import the OrganizationModule
import { OrderCollectionModule } from './orderCollection/orderCollection.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/auth'), // MongoDB connection
    ExcelModule,
    AuthModule,
    KaspiApiModule,
    OrganizationModule,
    OrderCollectionModule // Add the OrganizationModule
    // ScheduleTaskModule
  ],
  controllers: [KaspiController],
  providers: [KaspiService],
})
export class AppModule {}



