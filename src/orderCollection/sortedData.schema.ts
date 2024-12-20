import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SortedData extends Document {
  @Prop({ required: true, unique: true })
  organizationID: string;

  @Prop({ type: Array, default: [] })
  data: {
    code: string;
    name: string;
    quantity: number;
    totalPrice: number;
  }[];
}

export const SortedDataSchema = SchemaFactory.createForClass(SortedData);
