import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataKaspi } from '../kaspiApi/dataKaspi.schema';
import { SortedData } from './sortedData.schema';

@Injectable()
export class OrderCollectionService {
  constructor(
    @InjectModel(DataKaspi.name) private dataKaspiModel: Model<DataKaspi>,
    @InjectModel(SortedData.name) private sortedDataModel: Model<SortedData>,
  ) {}

  async saveSortedData(organizationID: string, data: any[]) {
    if (data.length === 0) {
      console.error('No data provided to saveSortedData.');
      throw new Error('No data to save.');
    }
  
    try {
      // Save each document as a standalone entry
      for (const item of data) {
        const newDocument = new this.sortedDataModel({
          organizationID,
          ...item,
        });
        await newDocument.save();
      }
  
      console.log('All documents saved successfully as standalone entries.');
    } catch (error) {
      console.error('Error saving sorted data:', error.message);
      throw new Error('Failed to save sorted data.');
    }
  }
  
  


}
