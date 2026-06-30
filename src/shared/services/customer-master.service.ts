import { api } from '@/core/network';

export type CustomerDropdownOption = { id: string; name: string };

const toOptions = (response: any, idField: string): CustomerDropdownOption[] => {
  const rows = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.data?.data)
      ? response.data.data
      : [];

  return rows.map((row: any) => ({ id: String(row[idField]), name: row.name }));
};

export const customerMasterService = {
  async getCreateCustomerDropdowns() {
    const [categories, channels, outletTypes, segmentations] = await Promise.all([
      api.get<any>('/customer-category', { params: { page: 1, limit: 200, status: 'ACTIVE' } }),
      api.get<any>('/channel', { params: { page: 1, limit: 200, status: 'ACTIVE' } }),
      api.get<any>('/outlet-type', { params: { page: 1, limit: 200, status: 'ACTIVE' } }),
      api.get<any>('/segmentation', { params: { page: 1, limit: 200, status: 'ACTIVE' } }),
    ]);

    return {
      customerCategoryId: toOptions(categories, 'customerCategoryId'),
      channelId: toOptions(channels, 'channelId'),
      customerTypeId: toOptions(outletTypes, 'outletTypeId'),
      segmentation: toOptions(segmentations, 'segmentationId'),
    };
  },
};
