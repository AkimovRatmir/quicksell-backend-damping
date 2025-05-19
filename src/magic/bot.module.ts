import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, // needed for ConfigService
    JwtModule.register({}), // needed for JwtService
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
