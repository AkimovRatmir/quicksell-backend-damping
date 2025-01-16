import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { DataKaspi } from './dataKaspi.schema';
import { SortedData } from './sortedData.schema';

@Injectable()
export class KaspiApiService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(DataKaspi.name) private dataKaspiModel: Model<DataKaspi>,
    @InjectModel(SortedData.name) private sortedDataModel: Model<SortedData>, // Inject SortedData model
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
      const response = await lastValueFrom(this.httpService.get(url, config));
  
      const orders = response.data.data;
  
      if (!orders || orders.length === 0) {
        console.warn(`Service - No orders found for state ${state}`);
        return []; // Skip saving if no data is found
      }
  
      const asyncLoaders = orders.map(async (order) => {
        const orderEntriesUrl = `https://kaspi.kz/shop/api/v2/orders/${order.id}/entries`;
        const entriesResponse = await lastValueFrom(this.httpService.get(orderEntriesUrl, config));
  
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

  async getSortedData(organizationID: string): Promise<any> {
    return await this.sortedDataModel.find({ organizationID }).exec();
  }
  
  async deleteOrganizationData(organizationID: string): Promise<any> {
    try {
      // Delete from datakaspis collection
      const deletedDataKaspi = await this.dataKaspiModel.deleteMany({ organizationID });
      console.log(`Deleted ${deletedDataKaspi.deletedCount} documents from datakaspis`);
  
      // Delete from sorteddatas collection
      const deletedSortedData = await this.sortedDataModel.deleteMany({ organizationID });
      console.log(`Deleted ${deletedSortedData.deletedCount} documents from sorteddatas`);
  
      return {
        message: 'Data deleted successfully',
        deletedDataKaspi: deletedDataKaspi.deletedCount,
        deletedSortedData: deletedSortedData.deletedCount,
      };
    } catch (error) {
      console.error('Error deleting data:', error.message);
      throw new Error('Error deleting data');
    }
  }
  
  async updateStatusQS(id: string, newStatus: string): Promise<any> {
    if (!['assemble', 'ready', 'unready'].includes(newStatus)) {
      throw new Error('Invalid status. Allowed values: assemble, ready, unready.');
    }
  
    const updatedDoc = await this.sortedDataModel.findByIdAndUpdate(
      id,
      { statusQS: newStatus },
      { new: true } // Return the updated document
    );
  
    if (!updatedDoc) {
      throw new Error(`No document found with id: ${id}`);
    }
  
    return updatedDoc;
  }
  

  private async saveToMongoDB(data: any, organizationID: string, state: string) {
    try {
      const transformedData = data.data.map((item) => ({
        ...item,
        statusQS: 'assemble',
        statusFrom: state,
        organizationID, // <-- Add organizationID
      }));
  
      const transformedIncluded = data.included?.map((item) => ({
        ...item,
        statusQS: 'assemble',
        statusFrom: state,
        organizationID, // <-- Add organizationID
      })) || [];
  
      const allDocuments = [...transformedData, ...transformedIncluded];
  
      if (allDocuments.length === 0) {
        console.warn('No data to save. Skipping MongoDB save operation.');
        return;
      }
  
      // Save full data to datakaspis collection
      await this.dataKaspiModel.insertMany(allDocuments, { ordered: false });
  
      // Extract and save only required fields to sorteddatas collection
      const sortedData = allDocuments.map((item) => ({
        organizationID: item.organizationID,
        statusQS: item.statusQS,
        statusFrom: item.statusFrom,
        code: item.attributes.offer.code,
        name: item.attributes.offer.name,
        quantity: item.attributes.quantity,
        totalPrice: item.attributes.totalPrice,
      }));
  
      await this.sortedDataModel.insertMany(sortedData, { ordered: false });
  
      console.log('Sorted data saved successfully in sorteddatas collection.');
  
    } catch (error) {
      console.error('Error saving data to MongoDB:', error.message);
    }
  }
  
  
  
   
}




