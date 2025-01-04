import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SortedData extends Document {
  @Prop({ required: true })
  organizationID: string;

  @Prop()
  code: string; // Remove `required: true`

  @Prop()
  name: string; // Remove `required: true`

  @Prop({ type: Number })
  quantity: number;

  @Prop({ type: Number })
  totalPrice: number;

}

export const SortedDataSchema = SchemaFactory.createForClass(SortedData);

