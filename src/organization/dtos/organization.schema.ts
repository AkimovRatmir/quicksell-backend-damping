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

  @Prop({ required: false })
  @ApiProperty({ example: 'Ratmir' })
  firstName: string;

  @Prop({ required: false })
  @ApiProperty({ example: 'Akimov' })
  lastName: string;

  @Prop({ type: String })
  @ApiProperty({ required: false, example: '123456789012' })
  BIN?: string;

  @Prop({ type: String, default: '' })
  @ApiProperty({ required: false, example: 'KaspiTokenExample123' })
  KaspiToken?: string;

  @Prop({ type: String, default: 'false' })
  @ApiProperty({ required: true, example: 'true or false' })
  isPaid?: string;

  @Prop({ type: Number, default: 0 })
  @ApiProperty({ type: Number, required: false, example: '100, 500 , 1000' })
  capacity?: number; 

  @Prop({ type: String, default: 'off' })
  @ApiProperty({ type: Number, required: false, example: 'on or off' })
  isOn?: String; 

  @Prop({ type: String })
  @ApiProperty({ type: String, required: false, example: 'on or off' })
  isOnDemo?: string;

  @Prop({ type: Date })
  @ApiProperty({ required: false, example: '2025-05-14T14:00:00Z' })
  demoStartDate?: Date;

  @Prop({ type: Number, default: 0 })
  @ApiProperty({ required: false, example: 100 })
  stepGlob?: number;

  @Prop({ type: Number, default: 0 })
  @ApiProperty({ required: false, example: 1000 })
  minPriceGlob?: number;

  @Prop({ type: Number, default: 0 })
  @ApiProperty({ required:false, example: "5,10,15 ...." })
  maxPriceGlob?: number;

  @Prop({ type: String, default: '' })
  @ApiProperty({ required: false })
  kaspiLoginEmail?: string;
  
  @Prop({ type: String, default: '' })
  @ApiProperty({ required: false })
  kaspiPasswordEncrypted?: string;

}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
