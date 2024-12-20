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
    organizationID: string, // Include organizationID
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

        // Save the entire response for each order entry, including organizationID
        await this.saveToMongoDB(entriesResponse.data, organizationID);
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

  private async saveToMongoDB(data: any, organizationID: string) {
    try {
      // Check if a document already exists for the organizationID
      const existingDocument = await this.dataKaspiModel.findOne({ organizationID });
  
      if (existingDocument) {
        // Append the new data to the existing document's data array
        await this.dataKaspiModel.updateOne(
          { organizationID },
          {
            $push: {
              data: { $each: data.data }, // Append new data array
              included: { $each: data.included || [] }, // Append included if it exists
            },
          },
        );
        console.log('Data appended to existing document in MongoDB');
      } else {
        // Create a new document if it doesn't exist
        const newDocument = new this.dataKaspiModel({
          organizationID,
          data: data.data || [],
          included: data.included || [],
        });
        await newDocument.save();
        console.log('New document created in MongoDB');
      }
    } catch (error) {
      console.error('Error saving data to MongoDB:', error.message);
    }
  }
  
}




