import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExcelModule } from './excelInt/exel.module';
import { AuthModule } from './auth/auth.module';
import { KaspiApiModule } from './kaspiApi/kaspiApi.module';
import { OrganizationModule } from './organization/organization.module'; // Import the OrganizationModule
import { OrderCollectionModule } from './orderCollection/orderCollection.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotBazaModule } from './botbaza/product.module';
import { Product } from './botbaza/product.entity';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/auth'), // MongoDB connection
    ExcelModule,
    AuthModule,
    KaspiApiModule,
    OrganizationModule,
    OrderCollectionModule ,
    BotBazaModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432, // default PostgreSQL port
      username: 'postgres',
      password: '12345',
      database: 'products_python_bot',
      entities: [Product],
      synchronize: true, // set to false in production
    }),
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}



