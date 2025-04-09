import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class SortedData extends Document {
  @Prop({ required: true })
  @ApiProperty({ example: '1234567890' })
  organizationID: string;

  @Prop()
  @ApiProperty({ example: 'some data' })
  code: string;

  @Prop()
  @ApiProperty({ example: 'Product Name' })
  name: string;

  @Prop({ type: Number })
  @ApiProperty({ example: 5 })
  quantity: number;

  @Prop({ type: Number })
  @ApiProperty({ example: 49990 })
  totalPrice: number;
}

export const SortedDataSchema = SchemaFactory.createForClass(SortedData);

