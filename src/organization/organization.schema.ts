import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Organization extends Document {
  @Prop({ required: true, unique: true })
  organizationID: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ type: String })
  BIN?: string; // Optional field

  @Prop({ type: String })
  KaspiToken?: string; // Optional field
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
