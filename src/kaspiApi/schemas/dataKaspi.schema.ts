import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class DataKaspi extends Document {
  @Prop({ required: true })
  @ApiProperty()
  organizationID: string;

  @Prop({ type: Object }) // Allow flexible object structure
  @ApiProperty()
  attributes: any;

  @Prop({ type: Object }) // Allow flexible object structure
  @ApiProperty()
  relationships: any;

  @Prop({ type: Object }) // Allow flexible object structure
  @ApiProperty()
  links: any;

  @Prop()
  @ApiProperty()
  statusQS: string;

  @Prop()
  @ApiProperty()
  statusFrom: string;

  @Prop({ type: Array, default: [] })
  @ApiProperty()
data: any[];

}

export const DataKaspiSchema = SchemaFactory.createForClass(DataKaspi);

