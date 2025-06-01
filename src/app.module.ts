import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { KaspiApiModule } from './kaspiApi/kaspiApi.module';
import { OrganizationModule } from './organization/organization.module'; // Import the OrganizationModule
import { OrderCollectionModule } from './orderCollection/orderCollection.module';
import { BotBazaModule } from './botbaza/product.module';
import { Product } from './botbaza/dtos/product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotModule } from './magic/bot.module';


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
    BotModule,

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}



