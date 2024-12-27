import { Controller, Get, Query, Headers, BadRequestException } from '@nestjs/common';
import { KaspiApiService } from './kaspiApi.servise';
import { OrganizationService } from '../organization/organization.service';

@Controller('kaspi-api')
export class KaspiApiController {
  constructor(
    private readonly kaspiApiService: KaspiApiService,
    private readonly organizationService: OrganizationService, // Inject OrganizationService
  ) {}

  @Get('all-data')
  async getAllData() {
    return await this.kaspiApiService.getAllData();
  }

  @Get('orders')
  async getOrders(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('state') state: string,
    @Query('organizationID') organizationID: string, // Include organizationID in request
    @Headers('X-Auth-Token') authToken: string,
  ) {
    // Validate organizationID
    const isValidOrganization = await this.organizationService.validateOrganizationID(organizationID);
    if (!isValidOrganization) {
      throw new BadRequestException(`Invalid organizationID: ${organizationID}`);
    }

    // Fetch orders for the organization
    const requests = await Promise.all([
      this.kaspiApiService.getOrders(startDate, endDate, 'NEW', authToken, organizationID),
      this.kaspiApiService.getOrders(startDate, endDate, 'SIGN_REQUIRED', authToken, organizationID),
      this.kaspiApiService.getOrders(startDate, endDate, 'PICKUP', authToken, organizationID),
      this.kaspiApiService.getOrders(startDate, endDate, 'DELIVERY', authToken, organizationID),
      this.kaspiApiService.getOrders(startDate, endDate, 'KASPI_DELIVERY', authToken, organizationID),
      this.kaspiApiService.getOrders(startDate, endDate, 'ARCHIVE', authToken, organizationID),
    ]);

    return {
      NEW: requests[0],
      SIGN_REQUIRED: requests[1],
      PICKUP: requests[2],
      DELIVERY: requests[3],
      KASPI_DELIVERY: requests[4],
      ARCHIVE: requests[5],
    };
  }
}

