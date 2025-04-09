import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class SortedData extends Document {
  @Prop({ required: true })
  @ApiProperty()
  organizationID: string;

  @Prop({ required: true })
  @ApiProperty()
  statusQS: string;

  @Prop({ required: true })
  @ApiProperty()
  statusFrom: string;

  @Prop({ required: true })
  @ApiProperty()
  orderId: string;

  @Prop({ required: true })
  @ApiProperty()
  codeZK: string;

  @Prop({ required: true })
  @ApiProperty()
  assemble: string;

  @Prop({ required: true })
  @ApiProperty()
  code: string;

  @Prop({ required: true })
  @ApiProperty()
  name: string;

  @Prop({ required: true })
  @ApiProperty()
  quantity: number;

  @Prop()
  @ApiProperty()
  totalPrice: number;

  @Prop()
  @ApiProperty()
  paymentMode: string;

  @Prop()
  @ApiProperty()
  originFormattedAddress: string;

  @Prop()
  @ApiProperty()
  cityName: string;

  @Prop()
  @ApiProperty()
  plannedDeliveryDate: Date; // Use Date type if it's a valid date or null

  @Prop()
  @ApiProperty()
  creationDate: Date; // Use Date type for timestamp

  // Delivery Address Details
  @Prop()
  @ApiProperty()
  deliveryFormattedAddress: string;

  @Prop()
  @ApiProperty()
  deliveryStreetName: string;

  @Prop()
  @ApiProperty()
  deliveryStreetNumber: string;

  @Prop()
  @ApiProperty()
  deliveryTown: string;

  // Kaspi Delivery Information
  @Prop()
  @ApiProperty()
  kaspiWaybill: string;

  @Prop()
  @ApiProperty()
  kaspiWaybillNumber: string;

  @Prop({ type: Number, default: null })
  @ApiProperty()
  courierTransmissionDate: number; // Use Number type, with null as the default value if not available

  @Prop({ type: Number, default: null })
  @ApiProperty()
  courierTransmissionPlanningDate: number; // Use Number type, with null as the default value if not available

  // Customer Details
  @Prop()
  @ApiProperty()
  customerName: string;

  @Prop()
  @ApiProperty()
  customerFirstName: string;

  @Prop()
  @ApiProperty()
  customerLastName: string;

  @Prop()
  @ApiProperty()
  customerCellPhone: string;

  // Delivery Mode and cost
  @Prop()
  @ApiProperty()
  deliveryMode: string;

  @Prop({ type: Number, default: 0 })
  @ApiProperty()
  deliveryCost: number; 
}

export const SortedDataSchema = SchemaFactory.createForClass(SortedData);
