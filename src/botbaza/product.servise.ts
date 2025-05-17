// botbaza/product.servise.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './dtos/product.entity';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class BotBazaService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  async findAll(organizationID: string): Promise<Product[]> {
    return this.productModel.find({ organizationID }).exec();
  }

  async updateProduct(id: string, organizationID: string, updateData: UpdateProductDto): Promise<Product | null> {
    return this.productModel.findOneAndUpdate(
      { _id: id, organizationID },
      updateData,
      { new: true },
    );
  }

  async updateAllProductsSettings(
    organizationID: string,
    updateData: UpdateProductDto
  ): Promise<{ modifiedCount: number }> {
    const result = await this.productModel.updateMany(
      { organizationID },
      { $set: updateData }
    );
    return { modifiedCount: result.modifiedCount };
  }
  

  async deleteOneProduct(id: string, organizationID: string): Promise<string> {
    const deleted = await this.productModel.findOneAndDelete({ _id: id, organizationID });
    if (!deleted) {
      throw new Error('Product not found or not authorized');
    }
    return `Deleted product with id ${id}`;
  }

  async createProduct(organizationID: string, productData: any): Promise<Product> {
    const createdProduct = new this.productModel({ ...productData, organizationID });
    return createdProduct.save();
  }
}
