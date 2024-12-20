import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortedData } from './sortedData.schema';

@Injectable()
export class OrderCollectionService {
  constructor(
    @InjectModel(SortedData.name) private sortedDataModel: Model<SortedData>,
  ) {}

  async saveSortedData(organizationID: string, data: any[]) {
    const filteredData = data.map((item) => {
      const code = item?.attributes?.offer?.code || ''; // Use default value if not found
      const name = item?.attributes?.offer?.name || '';
      const quantity = item?.attributes?.quantity || 0;
      const totalPrice = item?.attributes?.totalPrice || 0;
  
      return { code, name, quantity, totalPrice };
    });
  
    try {
      // Check if a document already exists for the organizationID
      const existingDocument = await this.sortedDataModel.findOne({
        organizationID,
      });
  
      if (existingDocument) {
        // Append the filtered data to the existing document
        await this.sortedDataModel.updateOne(
          { organizationID },
          { $push: { data: { $each: filteredData } } },
        );
        console.log('Data appended to existing document');
      } else {
        // Create a new document if it doesn't exist
        const newDocument = new this.sortedDataModel({
          organizationID,
          data: filteredData,
        });
        await newDocument.save();
        console.log('New document created');
      }
    } catch (error) {
      console.error('Error saving sorted data:', error.message);
      throw new Error('Failed to save sorted data');
    }
  }
  
}
