// botbaza/product.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './dtos/product.entity';
import { BotBazaService } from './product.servise';
import { BotBazaController } from './product.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  providers: [BotBazaService],
  controllers: [BotBazaController],
})
export class BotBazaModule {}
