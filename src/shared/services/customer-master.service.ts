import { api } from '@/core/network';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';

export type CustomerDropdownOption = { id: string; name: string };

const toOptions = (response: any, idField: string): CustomerDropdownOption[] => {
  const rows = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.data?.data)
      ? response.data.data
      : [];

  return rows.map((row: any) => ({ id: String(row[idField]), name: row.name }));
};

const localOptions = async (
  repository: (typeof repositories)[
    | 'customerCategories'
    | 'channels'
    | 'outletTypes'
    | 'segmentations'],
  idField: string,
) => {
  const ownerId = useAuthStore.getState().user?.userId ?? '';
  if (!ownerId) return [];
  const rows = await repository.findAll(ownerId, { page: 1, limit: 200 });
  return rows
    .filter((row: any) => row.status === 'ACTIVE' && row[idField])
    .map((row: any) => ({ id: String(row[idField]), name: String(row.name ?? '') }));
};

export const customerMasterService = {
  async getCreateCustomerDropdowns() {
    try {
      const [categories, channels, outletTypes, segmentations] = await Promise.all([
        api.get<any>('/customer-category', { params: { page: 1, limit: 200, status: 'ACTIVE' } }),
        api.get<any>('/channel', { params: { page: 1, limit: 200, status: 'ACTIVE' } }),
        api.get<any>('/outlet-type', { params: { page: 1, limit: 200, status: 'ACTIVE' } }),
        api.get<any>('/segmentation', { params: { page: 1, limit: 200, status: 'ACTIVE' } }),
      ]);
      if (
        ![categories, channels, outletTypes, segmentations].every((response) => response.success)
      ) {
        throw new Error('Customer master data is unavailable from the API');
      }

      return {
        customerCategoryId: toOptions(categories, 'customerCategoryId'),
        channelId: toOptions(channels, 'channelId'),
        customerTypeId: toOptions(outletTypes, 'outletTypeId'),
        segmentation: toOptions(segmentations, 'segmentationId'),
      };
    } catch {
      const [customerCategoryId, channelId, customerTypeId, segmentation] = await Promise.all([
        localOptions(repositories.customerCategories, 'customerCategoryId'),
        localOptions(repositories.channels, 'channelId'),
        localOptions(repositories.outletTypes, 'outletTypeId'),
        localOptions(repositories.segmentations, 'segmentationId'),
      ]);
      return { customerCategoryId, channelId, customerTypeId, segmentation };
    }
  },
};
