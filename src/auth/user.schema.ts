import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as uuid from 'uuid';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @Prop({ required: true, unique: true })
  @ApiProperty({ example: '+77001234567' })
  phoneNumber: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'hashed_password' })
  password: string;

  @Prop({ default: () => uuid.v4() })
  @ApiProperty({ example: 'org-k1p9sd9u3' })
  organizationID: string;

  @Prop({ default: 'user' })
  @ApiProperty({ example: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
