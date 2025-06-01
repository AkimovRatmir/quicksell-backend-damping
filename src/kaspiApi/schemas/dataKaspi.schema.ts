import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class DataKaspi extends Document {
  @Prop({ required: true })
  organizationID: string;

  @Prop({ required: true }) // ✅ This line must be added
  orderId: string;

  @Prop({ type: Object })
  attributes: any;

  @Prop({ type: Object })
  relationships: any;

  @Prop({ type: Object })
  links: any;

  @Prop()
  statusQS: string;

  @Prop()
  statusFrom: string;

  @Prop({ type: Array, default: [] })
  data: any[];
}

export const DataKaspiSchema = SchemaFactory.createForClass(DataKaspi);
