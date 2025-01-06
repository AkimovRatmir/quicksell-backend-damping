import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from './organization.schema';

@Injectable()
export class OrganizationService {
  constructor(@InjectModel(Organization.name) private organizationModel: Model<Organization>) {}

  async createOrganization(organizationID: string, email: string, phoneNumber: string): Promise<Organization> {
    const existingOrganization = await this.organizationModel.findOne({ organizationID });
    if (existingOrganization) {
      throw new BadRequestException('Organization already exists');
    }

    const organization = new this.organizationModel({ organizationID, email, phoneNumber });
    return organization.save();
  }

  async getOrgByID(organizationID: string): Promise<Organization | null> {
    return await this.organizationModel.findOne({ organizationID })
  }

  async getAllOrg(): Promise<Organization[]> {
    return await this.organizationModel.find().exec();
  }

  async updateOrganization(organizationID: string, BIN: string, KaspiToken: string): Promise<Organization> {
    const organization = await this.organizationModel.findOneAndUpdate(
      { organizationID },
      { BIN, KaspiToken },
      { new: true },
    );

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    return organization;
  }

  // New method: Validate if an organizationID exists
  async validateOrganizationID(organizationID: string): Promise<boolean> {
    const organization = await this.organizationModel.findOne({ organizationID });
    return !!organization; // Return true if the organization exists, false otherwise
  }
}
