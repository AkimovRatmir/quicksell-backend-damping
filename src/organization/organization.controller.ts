import { Controller, Post, Body, Put } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

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
