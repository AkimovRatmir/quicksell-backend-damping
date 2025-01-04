import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { OrderCollectionService } from './orderCollection.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortedData } from './sortedData.schema';

@Controller('order-collection')
export class OrderCollectionController {
  constructor(
    private readonly orderCollectionService: OrderCollectionService,
    @InjectModel(SortedData.name) private readonly sortedDataModel: Model<SortedData>, // Inject SortedData model
  ) {}

  @Get('sort')
  async sortData(@Query('organizationID') organizationID: string) {
    if (!organizationID) {
      throw new BadRequestException('organizationID is required');
    }

    const dataFromDb = await this.sortedDataModel.find({ organizationID }).lean();
    console.log('Fetched Data from SortedData:', dataFromDb);

    const combinedData = dataFromDb.map((doc) => ({
      code: doc.code || '',
      name: doc.name || '',
      quantity: doc.quantity || 0,
      totalPrice: doc.totalPrice || 0,
    }));

    console.log('Prepared Combined Data:', combinedData);

    if (combinedData.length === 0) {
      console.error('No valid data found for sorting.');
      throw new Error('No data to process.');
    }

    await this.orderCollectionService.saveSortedData(organizationID, combinedData);

    return { message: 'Sorted data saved successfully' };
  }

  @Get('sorted-data')
async getSortedData(@Query('organizationID') organizationID: string): Promise<
  {
    organizationID: string;
    code: string;
    name: string;
    quantity: number;
    totalPrice: number;
  }[]
> {
  if (!organizationID) {
    throw new BadRequestException('organizationID is required');
  }

  const sortedData = await this.sortedDataModel.find({ organizationID }).lean();
  if (sortedData.length === 0) {
    return [];
  }

  return sortedData.map((doc) => ({
    organizationID: doc.organizationID,
    code: doc.code || '',
    name: doc.name || '',
    quantity: doc.quantity || 0,
    totalPrice: doc.totalPrice || 0,
  }));
}

}


