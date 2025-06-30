import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ArchiveKaspi extends Document {
  @Prop({ required: true })
  organizationID: string;

  @Prop({ required: true })
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

export const ArchiveKaspiSchema = SchemaFactory.createForClass(ArchiveKaspi);
