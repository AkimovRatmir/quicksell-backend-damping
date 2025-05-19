import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from './dtos/organization.schema';
import { Product } from 'src/botbaza/dtos/product.entity';
import { encrypt } from 'src/utils/crypto.util';

@Injectable()
export class OrganizationService {
  constructor(
  @InjectModel(Organization.name) private organizationModel: Model<Organization>,
  @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async createOrganization(
    organizationID: string, 
    email: string, 
    phoneNumber: string,
    KaspiToken: string,
    isPaid: string,
    capacity: number,
    minPriceGlob: number,
    stepGlob: number,
    maxPriceGlob: number,
    isOn: string,
    kaspiLoginEmail: string,
    kaspiPasswordEncrypted: string

    ): Promise<Organization> {
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

  async updateOrganization(
    organizationID: string,
    KaspiToken: string,
    isPaid: string,
    capacity: number,
    isOn: string,
    isOnDemo?: string,
    stepGlob?: number,
    minPriceGlob?: number,
    maxPriceGlob?: number,
    kaspiLoginEmail?: string,
    kaspiPasswordPlain?: string
  ): Promise<Organization> {
    const updateFields: any = {
      KaspiToken, isPaid, capacity, isOn, stepGlob, minPriceGlob, maxPriceGlob
    };
  
    if (isOnDemo === 'on') {
      updateFields.isOnDemo = 'on';
      updateFields.demoStartDate = new Date();
    }
  
    const organization = await this.organizationModel.findOne({ organizationID });
    if (!organization) throw new BadRequestException('Organization not found');
  
    if (organization.isOnDemo === 'on' && organization.demoStartDate) {
      const now = new Date();
      const oneWeekLater = new Date(organization.demoStartDate);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      if (now > oneWeekLater) {
        updateFields.isOnDemo = 'off';
      }
    }

    if (kaspiLoginEmail) {
      updateFields.kaspiLoginEmail = kaspiLoginEmail;
    }
    
    if (kaspiPasswordPlain) {
      const secret = process.env.ENCRYPTION_SECRET || 'default_fallback_secret';
      updateFields.kaspiPasswordEncrypted = encrypt(kaspiPasswordPlain, secret);
    }

    //stepGlob logic
    if (stepGlob !== undefined) {
      updateFields.stepGlob = stepGlob;
    
      // Push to all related products
      const productUpdate = await this.productModel.updateMany(
        { organizationID },
        { $set: { step: stepGlob } }
      );
    
      console.log(`${productUpdate.modifiedCount} products updated with stepGlob`);
    }

    //maxPriceGlob logic
    if (maxPriceGlob !== undefined) {
      updateFields.maxPriceGlob = maxPriceGlob;

      const products = await this.productModel.find({ organizationID });

      const bulkOps = products.map((product) => {
        const newMaxPrice = Math.floor(
          product.current_price + (product.current_price * maxPriceGlob)/100
        );

        return {
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { max_price: newMaxPrice } },
          },
        };
      });

      if (bulkOps.length > 0) {
        const result = await this.productModel.bulkWrite(bulkOps);
        console.log(`${result.modifiedCount} products updated with maxPriceGlob`);
      }
    }

    //minPriceGlob logic
    if (minPriceGlob !== undefined) {
      updateFields.minPriceGlob = minPriceGlob;
    
      const products = await this.productModel.find({ organizationID });
    
      const bulkOps = products.map((product) => {
        const newMinPrice = Math.floor(
          product.current_price - (product.current_price * minPriceGlob) / 100
        );
    
        return {
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { min_price: newMinPrice } },
          },
        };
      });
    
      if (bulkOps.length > 0) {
        const result = await this.productModel.bulkWrite(bulkOps);
        console.log(`${result.modifiedCount} products updated with minPriceGlob`);
      }
    }
    
    
  
    return this.organizationModel.findOneAndUpdate(
      { organizationID },
      updateFields,
      { new: true }
    );
  }
  
  

  // New method: Validate if an organizationID exists
  async validateOrganizationID(organizationID: string): Promise<boolean> {
    const organization = await this.organizationModel.findOne({ organizationID });
    return !!organization; // Return true if the organization exists, false otherwise
  }
}
