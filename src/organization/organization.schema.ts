import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Organization extends Document {
  @Prop({ required: true, unique: true })
  @ApiProperty({ example: 'org123' })
  organizationID: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'example@email.com' })
  email: string;

  @Prop({ required: true })
  @ApiProperty({ example: '+77001234567' })
  phoneNumber: string;

  @Prop({ type: String })
  @ApiProperty({ required: false, example: '123456789012' })
  BIN?: string;

  @Prop({ type: String })
  @ApiProperty({ required: false, example: 'KaspiTokenExample123' })
  KaspiToken?: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
