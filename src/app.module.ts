import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { KaspiApiModule } from './kaspiApi/kaspiApi.module';
import { OrganizationModule } from './organization/organization.module'; // Import the OrganizationModule
import { OrderCollectionModule } from './orderCollection/orderCollection.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotBazaModule } from './botbaza/product.module';
import { Product } from './botbaza/dtos/product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }), // MongoDB connection
    AuthModule,
    KaspiApiModule,
    OrganizationModule,
    OrderCollectionModule ,
    BotBazaModule,

    ConfigModule.forRoot({
      isGlobal: true,
    }),

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



