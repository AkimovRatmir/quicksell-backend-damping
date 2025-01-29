import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SortedData extends Document {
    @Prop({ required: true })
    organizationID: string;

    @Prop({ required: true })
    statusQS: string;

    @Prop({ required: true })
    statusFrom: string;

    @Prop({ required: true })
    orderId: string;

    @Prop({ required: true })
    codeZK: string;

    @Prop({ required: true })
    assemble: string;    

    @Prop({ required: true })
    code: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    totalPrice: number;

    @Prop()
    originFormattedAddress: string; // Example: "г. Алматы, проспект Турара Рыскулова, 61В"

    @Prop()
    cityName: string; // Example: "Алматы"

    @Prop()
    plannedDeliveryDate: number; // Timestamp

    @Prop()
    creationDate: number; // Timestamp

    // Delivery Address Details
    @Prop()
    deliveryFormattedAddress: string; // Example: "Бесагаш, улица Райымбек Батыра, 161Б/9, 103"

    @Prop()
    deliveryStreetName: string; // Example: "улица Райымбек Батыра"

    @Prop()
    deliveryStreetNumber: string; // Example: "161Б/9"

    @Prop()
    deliveryTown: string; // Example: "Бесагаш"

    // Kaspi Delivery Information
    @Prop()
    kaspiWaybill: string; // Waybill URL

    @Prop()
    kaspiWaybillNumber: string; // Example: "164235723"

    @Prop()
    courierTransmissionDate: number; // Timestamp

    @Prop()
    courierTransmissionPlanningDate: number; // Timestamp

    // Customer Details
    @Prop()
    customerName: string; // Example: "Галымжан"

    @Prop()
    customerFirstName: string; // Example: "Алексей"

    @Prop()
    customerLastName: string; // Example: "Гордеев"

    @Prop()
    customerCellPhone: string; // Example: "7777028202"

    // Delivery Mode
    @Prop()
    deliveryMode: string; // Example: "DELIVERY_REGIONAL_TODOOR"
}

export const SortedDataSchema = SchemaFactory.createForClass(SortedData);
