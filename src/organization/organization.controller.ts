import { Controller, Post, Body, Put, Get, BadRequestException, Param } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization } from './dtos/organization.schema';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dtos/organization.dto'; 
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BotService } from '../magic/bot.service';

@ApiTags('Organizations')
@ApiBearerAuth('access-token')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService,
    private readonly botService: BotService,  
    ) {}

  @Get('orgs')
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({ status: 200, type: [Organization] })
  async getAllOrg() {
    const organizations = await this.organizationService.getAllOrg();
    return { message: 'Organizations retrieved successfully', organizations };
  }

  @Get('org')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'loggen in organization' })
  @ApiResponse({ status: 200, type: Organization })
  async getOrgById(@Req() req) {
    const { organizationID } = req.user;
    const org = await this.organizationService.getOrgByID(organizationID);
    if (!org) throw new BadRequestException('Organization not found');
    return { message: 'Organization retrieved successfully', org };
  }


//   @Get('globals')
//   @UseGuards(AuthGuard('jwt'))
//   @ApiOperation({ summary: 'Get stepGlob and minPriceGlob by organizationID' })
//   @ApiResponse({ status: 200, schema: {
//     example: {
//       stepGlob: 100,
//       minPriceGlob: 1000
//     }
//   }})
// async getGlobals(@Req() req) {
//   const { organizationID } = req.user;
//   const org = await this.organizationService.getOrgByID(organizationID);

//   if (!org) throw new BadRequestException('Organization not found');

//   return {
//     stepGlob: org.stepGlob,
//     minPriceGlob: org.minPriceGlob
//   };
// }


  // @Post('create')
  // @ApiOperation({ summary: 'Create new organization' })
  // @ApiBody({ type: CreateOrganizationDto })
  // @ApiResponse({ status: 201, type: Organization })
  // async createOrganization(@Body() body: CreateOrganizationDto) {
  //   return this.organizationService.createOrganization(
  //     body.organizationID,
  //     body.email,
  //     body.phoneNumber,
  //   );
  // }

  @Put('update')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Securely update organization BIN and KaspiToken' })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiResponse({ status: 200, type: Organization })
  async updateOrganization(@Body() body: UpdateOrganizationDto, @Req() req) {
    const { organizationID } = req.user;
    const { KaspiToken, isPaid, capacity, isOn, isOnDemo, stepGlob, minPriceGlob, maxPriceGlob, kaspiLoginEmail, kaspiPasswordPlain } = body;
    
    if ( isPaid == "true" || isPaid == "false")
      return this.organizationService.updateOrganization(
        organizationID,
        KaspiToken,
        isPaid,
        capacity,
        isOn,
        isOnDemo,
        stepGlob,
        minPriceGlob,
        maxPriceGlob,
        body.kaspiLoginEmail,
        body.kaspiPasswordPlain
      );
    else {
        throw new BadRequestException('should include right isPaid info')
      }
        
  }

  @Post('start-bot')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Start Python bot for current organization' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Bot started successfully' })
  async startBot(@Req() req) {
    const { organizationID } = req.user;

    if (!organizationID) {
      throw new BadRequestException('Organization ID not found in token');
    }

    await this.organizationService.updateIsOn(organizationID, 'on');

    this.botService.runBot(organizationID);
    return { message: `Bot started for organization ${organizationID}` };
  }

  // Add inside OrganizationController

  @Post('stop-bot')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'stop the bot for current org' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'bot stopped successfully' })
  async stopBot(@Req() req) {
    const { organizationID } = req.user;

    if (!organizationID) {
      throw new BadRequestException('Organization ID not found in token');
    }

    await this.organizationService.updateIsOn(organizationID, 'off');
    return { message: `Bot stop requested for ${organizationID}` };
  }


}
