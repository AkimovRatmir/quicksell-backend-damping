import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DataKaspi extends Document {
  @Prop({ required: true })
  organizationID: string;

  @Prop({ type: Object }) // Allow flexible object structure
  attributes: any;

  @Prop({ type: Object }) // Allow flexible object structure
  relationships: any;

  @Prop({ type: Object }) // Allow flexible object structure
  links: any;

  @Prop()
  statusQS: string;

  @Prop()
  statusFrom: string;

  @Prop({ type: Array, default: [] })
data: any[];

}

export const DataKaspiSchema = SchemaFactory.createForClass(DataKaspi);

