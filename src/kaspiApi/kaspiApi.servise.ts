import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosRequestConfig } from 'axios/index';
import { lastValueFrom } from 'rxjs';
import { DataKaspi } from './schemas/dataKaspi.schema';
import { SortedData } from './schemas/sortedData.schema';
import { Organization } from 'src/organization/dtos/organization.schema';

@Injectable()
export class KaspiApiService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(DataKaspi.name) private dataKaspiModel: Model<DataKaspi>,
    @InjectModel(SortedData.name) private sortedDataModel: Model<SortedData>,
    @InjectModel(Organization.name) private organizationModel: Model<Organization>,
  ) {}

  /**
   * Fetches orders for a given date range, state, and organizationID.
   */
  async getOrders(
    startDate: string,
    endDate: string,
    state: string,
    organizationID: string,
  ): Promise<string[]> {
    const url = 'https://kaspi.kz/shop/api/v2/orders';
    const isArchive = state === 'ARCHIVE';

    const params = isArchive
      ? {
          'page[number]': 0,
          'page[size]': 100,
          'filter[orders][creationDate][$ge]': startDate,
          'filter[orders][creationDate][$le]': endDate,
          'filter[orders][state]': 'ARCHIVE',
          'include[orders]': 'user',
        }
      : {
          'page[number]': 0,
          'page[size]': 100,
          'filter[orders][state]': state,
          'filter[orders][creationDate][$ge]': startDate,
          'filter[orders][creationDate][$le]': endDate,
          'filter[orders][signatureRequired]': 'true',
          'include[orders]': 'user',
        };

      
    const organization = await this.organizationModel.findOne({ organizationID }).exec();
    if (!organization || !organization.KaspiToken) {
      throw new Error(`Kaspi Token not found for org: ${organizationID}`);
    }
  
    const authToken = organization.KaspiToken;
  
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
      const newOrders = response.data.data;
  
      if (!newOrders || newOrders.length === 0) {
        console.warn(`No new orders found for state ${state} for the org: ${organizationID}`);
        return [];
      }
  
      const existingKaspi = await this.dataKaspiModel.find({ organizationID }, 'orderId');
      const existingKaspiSet = new Set(existingKaspi.map((doc) => doc.orderId));
  
      const fetchedOrderIds: string[] = [];
  
      for (const order of newOrders) {
        const orderId = order.id;
        if (!orderId) continue;
  
        // ✅ Always track orderId as fetched to prevent deletion
        fetchedOrderIds.push(orderId);
  
        if (existingKaspiSet.has(orderId)) {
          // console.log(`⏩ Skipped (already exists): ${orderId}`);
          continue;
        }
  
        // console.log(`✅ New order found, saving: ${orderId}`);
        await this.saveToMongoDB(order, organizationID, state, authToken);
      }
  
      return fetchedOrderIds;
    } catch (error) {
      console.error('❌ Error in getOrders:', error.response?.data || error.message);
      return [];
    }
  }
  
  
  
  
  async cleanupStaleOrders(allFetchedOrderIds: string[], organizationID: string) {
    // console.log(`🧹 FINAL Cleanup. Keeping ${allFetchedOrderIds.length} orders`);
  
    const deletedSorted = await this.sortedDataModel.deleteMany({
      organizationID,
      orderId: { $nin: allFetchedOrderIds },
    });
  
    const deletedKaspi = await this.dataKaspiModel.deleteMany({
      organizationID,
      orderId: { $nin: allFetchedOrderIds },
    });
  
    // console.log(`🗑️ [Final Cleanup] Deleted from sortedData: ${deletedSorted.deletedCount}`);
    // console.log(`🗑️ [Final Cleanup] Deleted from dataKaspi: ${deletedKaspi.deletedCount}`);
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
      const orderEntriesUrl = `https://kaspi.kz/shop/api/v2/orders/${order.id}/entries`;
      // console.log(`📦 Fetching entries for orderId: ${order.id}`);
  
      const entriesResponse = await lastValueFrom(
        this.httpService.get(orderEntriesUrl, {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            'X-Auth-Token': authToken,
            Accept: 'application/vnd.api+json',
          },
        }),
      );
  
      const entries = entriesResponse.data.data || [];
      // console.log(`🔍 Entries fetched: ${entries.length} for orderId: ${order.id}`);
  
      const fullOrderData = {
        organizationID,
        statusQS: 'offDelivery',
        statusFrom: state,
        orderId: order.id,
        attributes: order.attributes,
        relationships: order.relationships,
        links: order.links,
        data: entries,
      };
  
      await this.dataKaspiModel.create(fullOrderData);
      // console.log(`📁 Saved to datakaspis: ${order.id}`);
  
      const sortedData = entries.map((entry) => ({
        organizationID,
        statusQS: 'offDelivery',
        statusFrom: state,
        orderId: order.id,
        assemble: order.attributes?.assembled,
        codeZK: order.attributes?.code || 'N/A',
        status: order.attributes?.status || 'N/A',
        code: entry.attributes?.offer?.code || 'N/A',
        name: entry.attributes?.offer?.name || 'Unknown Product',
        quantity: entry.attributes?.quantity || 0,
        totalPrice: entry.attributes?.totalPrice || 0,
        paymentMode: order.attributes?.paymentMode || 'N/A',
        originFormattedAddress: order.attributes?.originAddress?.address?.formattedAddress || 'N/A',
        cityName: order.attributes?.originAddress?.city?.name || 'N/A',
        plannedDeliveryDate: order.attributes?.plannedDeliveryDate || null,
        creationDate: order.attributes?.creationDate || null,
        deliveryFormattedAddress: order.attributes?.deliveryAddress?.formattedAddress || 'N/A',
        deliveryStreetName: order.attributes?.deliveryAddress?.streetName || 'N/A',
        deliveryStreetNumber: order.attributes?.deliveryAddress?.streetNumber || 'N/A',
        deliveryTown: order.attributes?.deliveryAddress?.town || 'N/A',
        kaspiWaybill: order.attributes?.kaspiDelivery?.waybill || 'N/A',
        kaspiWaybillNumber: order.attributes?.kaspiDelivery?.waybillNumber || 'N/A',
        courierTransmissionDate: order.attributes?.kaspiDelivery?.courierTransmissionDate || null,
        courierTransmissionPlanningDate: order.attributes?.kaspiDelivery?.courierTransmissionPlanningDate || null,
        customerName: order.attributes?.customer?.name || 'N/A',
        customerFirstName: order.attributes?.customer?.firstName || 'N/A',
        customerLastName: order.attributes?.customer?.lastName || 'N/A',
        customerCellPhone: order.attributes?.customer?.cellPhone || 'N/A',
        deliveryMode: order.attributes?.deliveryMode || 'N/A',
        deliveryCost: order.attributes?.deliveryCost || 0,
      }));
  
      if (sortedData.length > 0) {
        await this.sortedDataModel.insertMany(sortedData);
        // console.log(`✅ Inserted ${sortedData.length} sorted entries for orderId: ${order.id}`);
      } else {
        console.log(`⚠️ No entries to sort for orderId: ${order.id}`);
      }
    } catch (error) {
      console.error(`❌ Error saving order ${order.id}:`, error.message);
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
  async updateStatusQS(orderId: string, newStatus: string): Promise<any> {
    if (!['offDelivery', 'onDelivery'].includes(newStatus)) {
      throw new Error(
        'Invalid status. Allowed values: offDelivery, onDelivery.',
      );  
    }

    const updatedDoc = await this.sortedDataModel.updateMany(
      {orderId},
      { statusQS: newStatus },
      { new: true },
    );

    if (!updatedDoc) {
      throw new Error(`No document found with id: ${orderId}`);
    }

    return updatedDoc;
  }

  /**
 * Updates order status to ASSEMBLE and modifies the relevant database records.
 */
  async updateOrderStatus(orderId: string, authToken: string): Promise<any> {
    const url = 'https://kaspi.kz/shop/api/v2/orders?page[number]=0&page[size]=20';
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
        'X-Auth-Token': authToken,
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


  
  async cancelOrder(orderId: string, orderCode: string, reason: string, comment: string, authToken: string): Promise<any> {
    const url = 'https://kaspi.kz/shop/api/v2/orders';
  
    const payload = {
      data: {
        type: 'orders',
        id: orderId,
        attributes: {
          code: orderCode,
          status: 'CANCELLED',
          cancellationReason: reason,
          cancellationComment: comment || '',
        },
      },
    };
  
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'X-Auth-Token': authToken,
        Accept: 'application/vnd.api+json',
      },
    };
  
    try {
      const response = await lastValueFrom(this.httpService.post(url, payload, config));
      return { message: 'Order cancelled successfully', response: response.data };
    } catch (error) {
      console.error('Error cancelling order:', error.response?.data || error.message);
      throw new BadRequestException('Failed to cancel order');
    }
  }
  
  
}