import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./product.entity";
import { BotBazaServise } from "./product.servise";
import { BotBazaController } from "./product.controller";

@Module({
    imports: [ TypeOrmModule.forFeature([Product])],
    providers: [ BotBazaServise ],
    controllers: [ BotBazaController ],
})
export class BotBazaModule {}
