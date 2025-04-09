import { Controller, Post, Body, Put, Get, BadRequestException, Param } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization } from './organization.schema';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dtos/organization.dto'; 
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('orgs')
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({ status: 200, type: [Organization] })
  async getAllOrg() {
    const organizations = await this.organizationService.getAllOrg();
    return { message: 'Organizations retrieved successfully', organizations };
  }

  @Get('org/:organizationID')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'organizationID', type: String })
  @ApiResponse({ status: 200, type: Organization })
  async getOrgById(@Param('organizationID') organizationID: string) {
    const org = await this.organizationService.getOrgByID(organizationID);
    if (!org) throw new BadRequestException('Organization not found');
    return { message: 'Organization retrieved successfully', org };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create new organization' })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({ status: 201, type: Organization })
  async createOrganization(@Body() body: CreateOrganizationDto) {
    return this.organizationService.createOrganization(
      body.organizationID,
      body.email,
      body.phoneNumber,
    );
  }

  @Put('update')
  @ApiOperation({ summary: 'Update organization BIN and KaspiToken' })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiResponse({ status: 200, type: Organization })
  async updateOrganization(@Body() body: UpdateOrganizationDto) {
    return this.organizationService.updateOrganization(
      body.organizationID,
      body.BIN,
      body.KaspiToken,
    );
  }
}
