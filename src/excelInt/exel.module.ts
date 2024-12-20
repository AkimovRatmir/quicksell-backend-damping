import { Module } from '@nestjs/common';
import { ExcelController } from './exel.controller'; 
import { ExcelService } from './exel.servise'; 
import { Excel1Controller } from './exel1.controller';

@Module({
  controllers: [ExcelController, Excel1Controller],
  providers: [ExcelService],
})
export class ExcelModule {}
