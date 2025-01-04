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
        'X-Auth-Token': 'YOUR_KASPI_API_TOKEN',
        Accept: 'application/vnd.api+json',
      },
      params,
    };
  
    try {
      console.log('Service - Fetching Orders with Config:', config);
      const response = await lastValueFrom(this.httpService.get(url, config));
      console.log('Service - API Response:', JSON.stringify(response.data, null, 2));
  
      const orders = response.data.data;
  
      if (!orders || orders.length === 0) {
        console.warn(`Service - No orders found for state ${state}`);
        return []; // Skip saving if no data is found
      }
  
      const asyncLoaders = orders.map(async (order) => {
        const orderEntriesUrl = `https://kaspi.kz/shop/api/v2/orders/${order.id}/entries`;
        const entriesResponse = await lastValueFrom(this.httpService.get(orderEntriesUrl, config));
        console.log('Service - Order Entries Response:', JSON.stringify(entriesResponse.data, null, 2));
  
        // Save to MongoDB
        await this.saveToMongoDB(entriesResponse.data, organizationID, state);
      });
  
      await Promise.all(asyncLoaders);
      return orders;
    } catch (error) {
      console.error('Error in getOrders:', error.response?.data || error.message);
      return []; // Return empty array for errors
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
      // Prepare the data with additional fields
      const transformedData = data.data.map((item) => ({
        ...item,
        statusQS: 'assemble',
        statusFrom: state,
        organizationID,
      }));
  
      const transformedIncluded = data.included?.map((item) => ({
        ...item,
        statusQS: 'assemble',
        statusFrom: state,
        organizationID,
      })) || [];
  
      // Combine all data into a single array
      const allDocuments = [...transformedData, ...transformedIncluded];
  
      if (allDocuments.length === 0) {
        console.warn('No data to save. Skipping MongoDB save operation.');
        return;
      }
  
      // Use insertMany to save all documents directly
      await this.dataKaspiModel.insertMany(allDocuments, { ordered: false });
      console.log('All documents saved successfully as standalone entries.');
    } catch (error) {
      console.error('Error saving data to MongoDB:', error.message);
    }
  }
  
   
}




