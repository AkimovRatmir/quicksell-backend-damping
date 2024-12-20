import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { OrderCollectionService } from './orderCollection.service';
import { KaspiApiService } from '../kaspiApi/kaspiApi.servise';

@Controller('order-collection')
export class OrderCollectionController {
  constructor(
    private readonly orderCollectionService: OrderCollectionService,
    private readonly kaspiApiService: KaspiApiService, // Reuse the KaspiApiService
  ) {}

  @Get('save')
  async saveSortedData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('state') state: string,
    @Query('organizationID') organizationID: string,
  ) {
    if (!organizationID) {
      throw new BadRequestException('organizationID is required');
    }

    // Fetch data from Kaspi API
    const data = await this.kaspiApiService.getOrders(
      startDate,
      endDate,
      state,
      'YOUR_KASPI_API_TOKEN', // Replace with the actual auth token or pass it dynamically
      organizationID,
    );

    // Save the sorted data
    await this.orderCollectionService.saveSortedData(organizationID, data);

    return { message: 'Sorted data saved successfully' };
  }
}
