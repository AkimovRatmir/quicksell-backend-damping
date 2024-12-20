import { Controller, Get } from '@nestjs/common';
import { KaspiService } from './kaspi.service';

@Controller('kaspi')
export class KaspiController {
  constructor(private readonly kaspiService: KaspiService) {}

  @Get('start')
  async startProcess() {
    const page = await this.kaspiService.getNewPage();
    await this.kaspiService.login(page, process.env.KASPI_LOGIN ?? '', process.env.KASPI_PASSWORD ?? '');

    // Example of reading an Excel file
    const data = await this.kaspiService.readExcel('/home/ratmir/kaspiBotBaza/baza.xlsx');
    console.log(data);

    await this.kaspiService.closeBrowser();
    return 'Process started';
  }
}



