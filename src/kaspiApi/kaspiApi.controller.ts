import { Controller, Get, Query, Headers, BadRequestException, Delete, Patch, Param, Body, Post, } from '@nestjs/common';
import { KaspiApiService } from './kaspiApi.servise';
import { OrganizationService } from '../organization/organization.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { DataKaspi } from './schemas/dataKaspi.schema';
import { SortedData } from './schemas/sortedData.schema';

@ApiTags('KaspiApi')
@Controller('kaspi-api')
export class KaspiApiController {
  constructor(
    private readonly kaspiApiService: KaspiApiService,
    private readonly organizationService: OrganizationService,
  ) {}

  @Get('all-data')
  @ApiOperation({ summary: 'Get all raw Kaspi data from MongoDB' })
  @ApiResponse({ status: 200, type: [DataKaspi] })
  async getAllData() {
    return await this.kaspiApiService.getAllData();
  }

  @Delete('delete-data')
  @ApiOperation({ summary: 'Delete all data for given organizationID' })
  @ApiQuery({ name: 'organizationID', required: true })
  async deleteOrganizationData(@Query('organizationID') organizationID: string) {
    if (!organizationID) {
      throw new BadRequestException('organizationID is required');
    }
    return await this.kaspiApiService.deleteOrganizationData(organizationID);
  }

  @Get('sorted-data')
  @ApiOperation({ summary: 'Get sorted data for a given organizationID' })
  @ApiQuery({ name: 'organizationID', required: true })
  @ApiResponse({ status: 200, type: [SortedData] })
  async getSortedData(@Query('organizationID') organizationID: string) {
    if (!organizationID) {
      throw new BadRequestException('organizationID is required');
    }
    return await this.kaspiApiService.getSortedData(organizationID);
  }

  @Patch('sorted/update-status/:id')
  @ApiOperation({ summary: 'Update statusQS field in sortedData by ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ schema: { example: { statusQS: 'Delivered' } } })
  async updateStatusQS(@Param('id') id: string, @Body('statusQS') statusQS: string) {
    if (!statusQS) {
      throw new BadRequestException('statusQS is required');
    }
    return await this.kaspiApiService.updateStatusQS(id, statusQS);
  }

  @Post('update-order')
  @ApiOperation({ summary: 'Update order status to ASSEMBLE and fetch updated data' })
  @ApiHeader({ name: 'X-Auth-Token', required: true })
  @ApiBody({ schema: { example: { orderId: 'order_id_here' } } })
  async updateOrder(
    @Body('orderId') orderId: string,
    @Headers('X-Auth-Token') authToken: string,
  ) {
    if (!orderId) {
      throw new BadRequestException('orderId is required');
    }

    return await this.kaspiApiService.updateOrderStatus(orderId, authToken);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Fetch new Kaspi orders by date and organizationID' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'organizationID', required: true })
  @ApiHeader({ name: 'X-Auth-Token', required: true })
  @ApiResponse({ status: 200, description: 'Array of order objects' })
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

    const states = ['NEW', 'SIGN_REQUIRED', 'PICKUP', 'DELIVERY', 'KASPI_DELIVERY', 'ARCHIVE'];
    const results = await Promise.all(
      states.map((state) =>
        this.kaspiApiService
          .getOrders(startDate, endDate, state, authToken, organizationID)
          .catch((error) => {
            console.error(`Error fetching orders for state ${state}:`, error.message);
            return [];
          }),
      ),
    );

    return results.filter((result) => result.length > 0);
  }
}
