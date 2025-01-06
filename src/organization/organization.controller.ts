import { Controller, Post, Body, Put, Get, BadRequestException, Param } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('orgs')
  async getAllOrg() {
    try {
      const organizations = await this.organizationService.getAllOrg();
      return { message: 'Organizations retrived successfully', organizations };
    } catch (error){
      throw new BadRequestException(error.message);
    }
  }

  @Get('org/:organizationID')
  async getOrgById(@Param('organizationID') organizationID: string) {
    try {
      const org = await this.organizationService.getOrgByID(organizationID);
      if (!org) {
        throw new BadRequestException('Organization not found');
      }
      return { message: 'Organization retrived successfully', org };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('create')
  async createOrganization(
    @Body('organizationID') organizationID: string,
    @Body('email') email: string,
    @Body('phoneNumber') phoneNumber: string,
  ) {
    return this.organizationService.createOrganization(organizationID, email, phoneNumber);
  }

  @Put('update')
  async updateOrganization(
    @Body('organizationID') organizationID: string,
    @Body('BIN') BIN: string,
    @Body('KaspiToken') KaspiToken: string,
  ) {
    return this.organizationService.updateOrganization(organizationID, BIN, KaspiToken);
  }
}
