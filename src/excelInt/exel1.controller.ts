import { Controller, Get } from '@nestjs/common';
import { ExcelService } from './exel.servise';
import * as slug from 'slug';

@Controller('excel')
export class Excel1Controller {
  constructor(private readonly excelService: ExcelService) {}

  @Get()
  getExcelDataWithSlug() {
    const data = this.excelService.readExcelFile();

    // Process each item to add a slug, PNGurl, and artukul
    const result = data.map((item: any) => {
      const processedItem: any = {};

      for (const [key, value] of Object.entries(item)) {
        processedItem[slug(key)] = value;
      }

      
                                        
      return processedItem;
    });

    return result;
  }
}

