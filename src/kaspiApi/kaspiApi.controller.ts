import { Controller, Get, Query, Headers, BadRequestException, Delete, Patch, Param, Body, Post, UseGuards, Req, } from '@nestjs/common';
import { KaspiApiService } from './kaspiApi.servise';
import { OrganizationService } from '../organization/organization.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody, ApiHeader, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DataKaspi } from './schemas/dataKaspi.schema';
import { SortedData } from './schemas/sortedData.schema';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('KaspiApi')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
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
  @ApiOperation({ summary: 'Delete all data for a ligged in org' })
  async deleteOrganizationData(@Req() req) {
    const { organizationID } = req.user;
    if ( !organizationID ){
      throw new BadRequestException('invalid token, or not existing user')
    }
    return await this.kaspiApiService.deleteOrganizationData(organizationID);
  }

  @Get('sorted-data')
  @ApiOperation({ summary: 'Get sorted data for a loggen in org' })
  @ApiResponse({ status: 200, type: [SortedData] })
  async getSortedData(@Req () req) {
    const { organizationID } = req.user;
    if (!organizationID) {
      throw new BadRequestException('token requred');
    }
    return await this.kaspiApiService.getSortedData(organizationID);
  }

  @Patch('sorted/update-status/:orderId')
  @ApiOperation({ summary: 'Update statusQS field in sortedData by orderId' })
  @ApiParam({ name: 'orderId', required: true })
  @ApiBody({ schema: { example: { statusQS: 'offDelivery' } } })
  async updateStatusQS(@Param('orderId') orderId: string, @Body('statusQS') statusQS: string) {
    if (!statusQS) {
      throw new BadRequestException('statusQS is required');
    }
    return await this.kaspiApiService.updateStatusQS(orderId, statusQS);
  }

  @Post('update-order')
  @ApiOperation({ summary: 'Update order status to ASSEMBLE and fetch updated data' })
  @ApiBody({ schema: { example: { orderId: 'order_id_here' } } })
  async updateOrder(
    @Body('orderId') orderId: string,
    @Req () req,
  ) {
    const { organizationID } = req.user;
    const organization = await this.organizationService.getOrgByID(organizationID);

    if ( !organization || !organization.KaspiToken ){
      throw new BadRequestException('Kaspi Token not found')
    } else if (!orderId) {
      throw new BadRequestException('orderId is required');
    }

    const authToken = organization.KaspiToken;
    return await this.kaspiApiService.updateOrderStatus(orderId, authToken);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Fetch new Kaspi orders by date for logged in org' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'state', required: false })
  @ApiResponse({ status: 200, description: 'Array of order objects' })
  async getOrders(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('state') state: string,
    @Req() req,
  ) {
    const { organizationID } = req.user;


    // const isValidOrganization = await this.organizationService.validateOrganizationID(organizationID);
    // if (!isValidOrganization) {
    //   console.error('Wrong token:', organizationID);
    //   throw new BadRequestException(`Invalid organizationID: ${organizationID}`);
    // }

    const states = ['NEW', 'SIGN_REQUIRED', 'PICKUP', 'DELIVERY', 'KASPI_DELIVERY', 'ARCHIVE'];
    const results = await Promise.all(
      states.map((state) =>
        this.kaspiApiService
          .getOrders(startDate, endDate, state, organizationID)
          .catch((error) => {
            console.error(`Error fetching orders for state ${state}:`, error.message);
            return [];
          }),
      ),
    );

    return results.filter((result) => result.length > 0);
  }
}
