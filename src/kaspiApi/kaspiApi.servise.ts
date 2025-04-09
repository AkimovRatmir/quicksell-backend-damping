import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosRequestConfig } from 'axios/index';
import { lastValueFrom } from 'rxjs';
import { DataKaspi } from './schemas/dataKaspi.schema';
import { SortedData } from './schemas/sortedData.schema';

@Injectable()
export class KaspiApiService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(DataKaspi.name) private dataKaspiModel: Model<DataKaspi>,
    @InjectModel(SortedData.name) private sortedDataModel: Model<SortedData>,
  ) {}

  /**
   * Fetches orders for a given date range, state, and organizationID.
   */
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
      const orders = response.data.data;

      if (!orders || orders.length === 0) {
        console.warn(`No orders found for state ${state}`);
        return [];
      }

      // Process orders and save them to MongoDB
      const asyncLoaders = orders.map(async (order) => {
        await this.saveToMongoDB(order, organizationID, state, authToken);
      });

      await Promise.all(asyncLoaders);
      return orders;
    } catch (error) {
      console.error(
        'Error in getOrders:',
        error.response?.data || error.message,
      );
      return [];
    }
  }

  /**
   * Method to save all data to db and sort to sorteddatas
   */
  private async saveToMongoDB(
    order: any,
    organizationID: string,
    state: string,
    authToken: string,
  ) {
    try {
      // Fetch entries for the order
      const orderEntriesUrl = `https://kaspi.kz/shop/api/v2/orders/${order.id}/entries`;
      const entriesResponse = await lastValueFrom(
        this.httpService.get(orderEntriesUrl, {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            'X-Auth-Token': authToken,
            Accept: 'application/vnd.api+json',
          },
        }),
      );

      // Construct the full order object with entries
      const fullOrderData = {
        organizationID,
        statusQS: 'assemble',
        statusFrom: state,
        ...order, // Full order details
        entries: entriesResponse.data.data || [], // Store related entries
      };

      // Save full order object in datakaspis collection
      await this.dataKaspiModel.create(fullOrderData);
      // sSorting Logic: Extract key attributes and save to `sortedData`
      const sortedData = entriesResponse.data.data.map((entry) => ({
        organizationID: organizationID,
        statusQS: 'assemble',
        statusFrom: state,
        orderId: order.id,
        assemble: order.attributes?.assembled,
        codeZK: order.attributes?.code || 'vlad idi nahui',
        code: entry.attributes?.offer?.code || 'N/A',
        name: entry.attributes?.offer?.name || 'Unknown Product',
        quantity: entry.attributes?.quantity || 0,
        totalPrice: entry.attributes?.totalPrice || 0,
        paymentMode: order.attributes?.paymentMode || 'N/A',
      
        // Address details
        originFormattedAddress: order.attributes?.originAddress?.address?.formattedAddress || 'N/A',
        cityName: order.attributes?.originAddress?.city?.name || 'N/A',
        plannedDeliveryDate: order.attributes?.plannedDeliveryDate || null,
        creationDate: order.attributes?.creationDate || null,
      
        // Delivery details
        deliveryFormattedAddress: order.attributes?.deliveryAddress?.formattedAddress || 'N/A',
        deliveryStreetName: order.attributes?.deliveryAddress?.streetName || 'N/A',
        deliveryStreetNumber: order.attributes?.deliveryAddress?.streetNumber || 'N/A',
        deliveryTown: order.attributes?.deliveryAddress?.town || 'N/A',
      
        // Kaspi Delivery Info
        kaspiWaybill: order.attributes?.kaspiDelivery?.waybill || 'N/A',
        kaspiWaybillNumber: order.attributes?.kaspiDelivery?.waybillNumber || 'N/A',
        
        // Make sure that these fields are either null or a valid timestamp number
        courierTransmissionDate: 
          order.attributes?.kaspiDelivery?.courierTransmissionDate === 'N/A' 
            ? null 
            : order.attributes?.kaspiDelivery?.courierTransmissionDate,
            
        courierTransmissionPlanningDate: 
          order.attributes?.kaspiDelivery?.courierTransmissionPlanningDate === 'N/A' 
            ? null 
            : order.attributes?.kaspiDelivery?.courierTransmissionPlanningDate,
      
        // Customer details
        customerName: order.attributes?.customer?.name || 'N/A',
        customerFirstName: order.attributes?.customer?.firstName || 'N/A',
        customerLastName: order.attributes?.customer?.lastName || 'N/A',
        customerCellPhone: order.attributes?.customer?.cellPhone || 'N/A',
      
        // Delivery Mode
        deliveryMode: order.attributes?.deliveryMode || 'N/A',
        deliveryCost: order.attributes?.deliveryCost || 0,
      }));
      
      // After modifying the data, save it to the database
      if (sortedData.length > 0) {
        try {
          await this.sortedDataModel.insertMany(sortedData);
          console.log('Sorted data saved successfully.');
        } catch (error) {
          console.error('Error saving sorted data:', error.message);
        }
      } else {
        console.log('No sorted data to save.');
      }
                 
    } catch (error) {
      console.error('Error saving order to MongoDB:', error.message);
    }
  }

  /**
   * Retrieves all data stored in MongoDB.
   */
  async getAllData(): Promise<any> {
    try {
      return await this.dataKaspiModel.find().exec();
    } catch (error) {
      console.error('Error fetching all data:', error.message);
      throw new Error('Database retrieval error');
    }
  }

  /**
   * Retrieves sorted data for a specific organization.
   */
  async getSortedData(organizationID: string): Promise<any> {
    return await this.sortedDataModel.find({ organizationID }).exec();
  }

  /**
   * Deletes all data for a given organizationID.
   */
  async deleteOrganizationData(organizationID: string): Promise<any> {
    try {
      const deletedDataKaspi = await this.dataKaspiModel.deleteMany({
        organizationID,
      });
      const deletedSortedData = await this.sortedDataModel.deleteMany({
        organizationID,
      });

      return {
        message: 'Data deleted successfully',
        deletedDataKaspi: deletedDataKaspi.deletedCount,
        deletedSortedData: deletedSortedData.deletedCount,
      };
    } catch (error) {
      console.error('Error deleting data:', error.message);
      throw new Error('Database deletion error');
    }
  }

  /**
   * Updates the statusQS field for a given document ID.
   */
  async updateStatusQS(id: string, newStatus: string): Promise<any> {
    if (!['assemble', 'onDelivery', 'Delivered'].includes(newStatus)) {
      throw new Error(
        'Invalid status. Allowed values: assemble, ready, unready.',
      );  
    }

    const updatedDoc = await this.sortedDataModel.findByIdAndUpdate(
      id,
      { statusQS: newStatus },
      { new: true },
    );

    if (!updatedDoc) {
      throw new Error(`No document found with id: ${id}`);
    }

    return updatedDoc;
  }

  /**
 * Updates order status to ASSEMBLE and modifies the relevant database records.
 */
  async updateOrderStatus(orderId: string, authToken: string): Promise<any> {
    const url = 'https://kaspi.kz/shop/api/v2/orders';
    const payload = {
      data: {
        type: 'orders',
        id: orderId,
        attributes: {
          status: 'ASSEMBLE',
          numberOfSpace: '1',
        },
      },
      page: {
        number: 0,
      },
    };
  
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': 'YOUR_KASPI_API_TOKEN',
        Accept: 'application/vnd.api+json',
      },
    };
  
    try {
      // Step 1: Send POST request to update order status
      const response = await lastValueFrom(this.httpService.post(url, payload, config));
  
      console.log(`Order ${orderId} status updated to ASSEMBLE`);
  
      // Step 2: Extract the "self" link for fetching order details
      const orderSelfLink = response.data?.data?.links?.self;
      if (!orderSelfLink) {
        throw new Error(`Self link not found for order ${orderId}`);
      }
  
      // Step 3: Fetch the updated order details
      const orderResponse = await lastValueFrom(this.httpService.get(orderSelfLink, config));
  
      const updatedOrder = orderResponse.data?.data;
      const kaspiWaybill = updatedOrder?.attributes?.kaspiDelivery?.waybill || 'N/A';
  
      console.log(`Fetched kaspiWaybill for order ${orderId}: ${kaspiWaybill}`);
  
      // Step 4: Update the database with the new kaspiWaybill
      await this.sortedDataModel.updateMany(
        { orderId },
        { $set: { assemble: 'true', kaspiWaybill } }
      );
  
      await this.dataKaspiModel.updateMany(
        { 'attributes.id': orderId },
        { $set: { 'attributes.status': 'ASSEMBLE', 'attributes.kaspiDelivery.waybill': kaspiWaybill } }
      );
      return { message: 'Order updated successfully', kaspiWaybill };
    } catch (error) {
      console.error('Error updating order status:', error.response?.data || error.message);
      throw new BadRequestException('Failed to update order status');
    }
  }
  
}