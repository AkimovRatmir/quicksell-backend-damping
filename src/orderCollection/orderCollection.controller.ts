import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { OrderCollectionService } from './orderCollection.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortedData } from './sortedData.schemaa';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse, } from '@nestjs/swagger';

@ApiTags('Order Collection (sort the data)')
@Controller('order-collection')
export class OrderCollectionController {
  constructor(
    private readonly orderCollectionService: OrderCollectionService,
    @InjectModel(SortedData.name)
    private readonly sortedDataModel: Model<SortedData>,
  ) {}

  @Get('sort')
  @ApiOperation({
    summary: 'Fetches raw data from DataKaspi, transforms & saves to SortedData',
  })
  @ApiQuery({ name: 'organizationID', required: true })
  @ApiResponse({
    status: 201,
    description: 'Sorted data processed and saved successfully',
    schema: {
      example: {
        message: 'Sorted data saved successfully',
      },
    },
  })
  async sortData(@Query('organizationID') organizationID: string) {
    if (!organizationID) {
      throw new BadRequestException('organizationID is required');
    }

    const dataFromDb =
      await this.orderCollectionService.getDataKaspiByOrganizationID(
        organizationID,
      );

    if (!dataFromDb || dataFromDb.length === 0) {
      throw new Error('No data to process.');
    }

    const combinedData = dataFromDb.map((doc) => ({
      code: doc.attributes?.offer?.code || '',
      name: doc.attributes?.offer?.name || '',
      quantity: doc.attributes?.quantity || 0,
      totalPrice: doc.attributes?.totalPrice || 0,
    }));

    await this.orderCollectionService.saveSortedData(
      organizationID,
      combinedData,
    );

    return { message: 'Sorted data saved successfully' };
  }

  @Get('sorted-data')
  @ApiOperation({ summary: 'Get already sorted data by organizationID' })
  @ApiQuery({ name: 'organizationID', required: true })
  @ApiResponse({ status: 200, type: [SortedData] })
  async getSortedData(
    @Query('organizationID') organizationID: string,
  ): Promise<
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

    const sortedData = await this.sortedDataModel
      .find({ organizationID })
      .lean();

    return sortedData.map((doc) => ({
      organizationID: doc.organizationID,
      code: doc.code || '',
      name: doc.name || '',
      quantity: doc.quantity || 0,
      totalPrice: doc.totalPrice || 0,
    }));
  }
}



