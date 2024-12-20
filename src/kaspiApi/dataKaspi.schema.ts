import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DataKaspi extends Document {
  @Prop({ required: true, unique: true })
  organizationID: string;

  @Prop({ type: Array, default: [] }) // Store orders as an array
  data: any[];

  @Prop({ type: Array, default: [] }) // Store included data as an array
  included: any[];
}

export const DataKaspiSchema = SchemaFactory.createForClass(DataKaspi);

