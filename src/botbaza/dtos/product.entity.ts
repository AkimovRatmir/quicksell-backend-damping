// botbaza/dtos/product.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Product extends Document {
  @Prop({ required: true })
  @ApiProperty()
  organizationID: string;

  @Prop({ required: true })
  @ApiProperty()
  product_name: string;

  @Prop({ required: true })
  @ApiProperty()
  url: string;

  @Prop()
  @ApiProperty()
  current_price: number;

  @Prop()
  @ApiProperty()
  price_on_page: number;

  @Prop({ required: true })
  @ApiProperty()
  sku: string;

  @Prop({ required: true })
  @ApiProperty()
  image_url: string;

  @Prop()
  @ApiProperty()
  decrease: string;

  @Prop()
  @ApiProperty()
  increase: string;

  @Prop()
  @ApiProperty()
  max_price: number;

  @Prop()
  @ApiProperty()
  min_price: number;

  @Prop()
  @ApiProperty()
  step: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
