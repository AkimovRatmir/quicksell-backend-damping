import { Controller, Get, Query, Headers, BadRequestException, Delete, Patch, Param, Body } from '@nestjs/common';
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

  @Delete('delete-data')
  async deleteOrganizationData(@Query('organizationID') organizationID: string) {
    if (!organizationID) {
      throw new BadRequestException('organizationID is required');
    }
    return await this.kaspiApiService.deleteOrganizationData(organizationID);
  }

  @Get('sorted-data')
  async getSortedData(@Query('organizationID') organizationID: string) {
    if (!organizationID) {
      throw new BadRequestException('organizationID is required');
    }
    return await this.kaspiApiService.getSortedData(organizationID);
  }

  @Patch('sorted/update-status/:id')
  async updateStatusQS(@Param('id') id: string, @Body('statusQS') statusQS: string) {
    if (!statusQS) {
      throw new BadRequestException('statusQS is required');
    }
    return await this.kaspiApiService.updateStatusQS(id, statusQS);
  }

  @Get('orders')
async getOrders(
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
  @Query('state') state: string,
  @Query('organizationID') organizationID: string,
  @Headers('X-Auth-Token') authToken: string,
) {

  const isValidOrganization = await this.organizationService.validateOrganizationID(organizationID);
  if (!isValidOrganization) {
    console.error('Invalid organizationID:', organizationID);
    throw new BadRequestException(`Invalid organizationID: ${organizationID}`);
  }

  // Fetch orders for the organization
  const states = ['NEW', 'SIGN_REQUIRED', 'PICKUP', 'DELIVERY', 'KASPI_DELIVERY', 'ARCHIVE'];
  const results = await Promise.all(
    states.map((state) =>
      this.kaspiApiService
        .getOrders(startDate, endDate, state, authToken, organizationID)
        .catch((error) => {
          console.error(`Error fetching orders for state ${state}:`, error.message);
          return []; // Return empty array for failed requests
        }),
    ),
  );

  const nonEmptyResults = results.filter((result) => result.length > 0);

  
  return nonEmptyResults;
}


}

