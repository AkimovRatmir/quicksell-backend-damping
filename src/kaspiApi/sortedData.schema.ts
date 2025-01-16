import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SortedData extends Document {
    @Prop({ required: true })
  organizationID: string; 

  @Prop({ required: true, enum: ['assemble', 'ready', 'unready'], default: 'assemble' })
  statusQS: string;

  @Prop({ required: true })
  statusFrom: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  totalPrice: number;
}

export const SortedDataSchema = SchemaFactory.createForClass(SortedData);
