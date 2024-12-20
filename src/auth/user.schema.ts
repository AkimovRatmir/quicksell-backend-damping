import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as uuid from 'uuid';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true }) // Ensure it's required and unique
  email: string;

  @Prop({ required: true, unique: true }) // Phone number is also unique
  phoneNumber: string;

  @Prop({ required: true }) // Password is still required
  password: string;

  @Prop({ default: () => uuid.v4() }) // Automatically generate organizationID
  organizationID: string;

  @Prop({ default: 'user' }) // Default role is 'user'
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
