import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { DataKaspi } from './dataKaspi.schema';

@Injectable()
export class KaspiApiService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(DataKaspi.name) private dataKaspiModel: Model<DataKaspi>,
  ) {}

  async getOrders(
    startDate: string,
    endDate: string,
    state: string,
    authToken: string,
    organizationID: string,
  ): Promise<any> {
    const url = 'https://kaspi.kz/shop/api/v2/orders';
  
    const params = {
      'page[number]': 0,
      'page[size]': 100,
      'filter[orders][state]': state,
      'filter[orders][creationDate][$ge]': startDate,
      'filter[orders][creationDate][$le]': endDate,
      'filter[orders][signatureRequired]': 'true',
      'include[orders]': 'user',
    };
  
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'X-Auth-Token': authToken,
        Accept: 'application/vnd.api+json',
      },
      params,
    };
  
    try {
      const response = await lastValueFrom(this.httpService.get(url, config));
      const orders: any[] = response.data.data;
  
      const asyncLoaders = orders.map(async (order) => {
        const orderEntriesUrl = `https://kaspi.kz/shop/api/v2/orders/${order.id}/entries`;
        const entriesResponse = await lastValueFrom(
          this.httpService.get(orderEntriesUrl, config),
        );
  
        // Save the entire response for each order entry, including organizationID and state
        await this.saveToMongoDB(entriesResponse.data, organizationID, state);
      });
  
      await Promise.all(asyncLoaders);
      return orders;
    } catch (error) {
      console.error(
        'Error fetching orders:',
        error.response?.data || error.message,
      );
      throw new Error(`Error fetching orders: ${error.message}`);
    }
  }
  
  async getAllData(): Promise<any> {
    try {
      const data = await this.dataKaspiModel.find().exec(); // Fetch all documents
      return data; // Return the retrieved documents
    } catch (error) {
      console.error('Error fetching all data from MongoDB:', error.message);
      throw new Error('Error fetching data from database');
    }
  }

  private async saveToMongoDB(data: any, organizationID: string, state: string) {
    try {
      // Add the `statusQS` and `statusFrom` fields to each object in the `data` array
      const dataWithStatus = data.data.map((item) => ({
        ...item,
        statusQS: 'assemble', // Add the statusQS field
        statusFrom: state,    // Add the statusFrom field based on the state
      }));
  
      const includedWithStatus = data.included?.map((item) => ({
        ...item,
        statusQS: 'assemble', // Add the statusQS field
        statusFrom: state,    // Add the statusFrom field if necessary
      })) || [];
  
      // Check if a document already exists for the organizationID
      const existingDocument = await this.dataKaspiModel.findOne({ organizationID });
  
      if (existingDocument) {
        // Append the new data to the existing document's data array
        await this.dataKaspiModel.updateOne(
          { organizationID },
          {
            $push: {
              data: { $each: dataWithStatus }, // Append new data array with statusQS and statusFrom
              included: { $each: includedWithStatus }, // Append included if it exists
            },
          },
        );
        console.log('Data appended to existing document in MongoDB');
      } else {
        // Create a new document if it doesn't exist
        const newDocument = new this.dataKaspiModel({
          organizationID,
          data: dataWithStatus,
          included: includedWithStatus,
        });
        await newDocument.save();
        console.log('New document created in MongoDB');
      }
    } catch (error) {
      console.error('Error saving data to MongoDB:', error.message);
    }
  }
  

  
  
  
}




