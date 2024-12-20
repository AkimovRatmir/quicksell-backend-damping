import { Controller, Get, Post, Body } from '@nestjs/common';
import { ExcelService } from './exel.servise';

@Controller('excel1')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  // Define a GET endpoint to return the Excel data
  @Get('all')
  getExcelData() {
    const data = this.excelService.readExcelFile();

    // Process each item to add additional fields if necessary
    const result = data.map((item: any) => {
      const processedItem: any = { ...item };
      return processedItem;
    });

    return result;
  }

  // Define a POST endpoint to update the 'decrease' field
  @Post('updateDecrease')
  updateDecrease(@Body() body: { artikul: string; newValue: string }) {
    const { artikul, newValue } = body;
    return this.excelService.updateColumn(artikul, 'decrease', newValue);
  }

  // Define a POST endpoint to update the 'increase' field
  @Post('updateIncrease')
  updateIncrease(@Body() body: { artikul: string; newValue: string }) {
    const { artikul, newValue } = body;
    return this.excelService.updateColumn(artikul, 'increase', newValue);
  }

  //maxPrice
  @Post('updateMaxPrice')
  updateMaxPrice(@Body() body: { artikul: string; newValue: string }) {
  const { artikul, newValue } = body;
  return this.excelService.updateColumn(artikul, 'maxPrice', newValue);
}

//minPrice
@Post('updateMinPrice')
updateMinPrice(@Body() body: { artikul: string; newValue: string }) {
  const { artikul, newValue } = body;
  return this.excelService.updateColumn(artikul, 'minPrice', newValue);
}

//step
@Post('updateStep')
updateStepPrice(@Body() body: { artikul: string; newValue: string }) {
  const { artikul, newValue } = body;
  return this.excelService.updateColumn(artikul, 'step', newValue);
}



}



