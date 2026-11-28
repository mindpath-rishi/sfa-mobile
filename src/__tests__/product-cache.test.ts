const mockOfflineState = { lastSyncTime: 'sync-1' as string | null };

jest.mock('@/core/network', () => ({ api: { get: jest.fn() } }));
jest.mock('@/core/navigation/role.utils', () => ({ isSalesman: () => true }));
jest.mock('@/core/offline/offline.store', () => ({
  isOfflineMode: () => true,
  useOfflineStore: { getState: () => mockOfflineState },
}));
jest.mock('@/core/store/auth.store', () => ({
  useAuthStore: { getState: () => ({ user: { userId: 'U1' } }) },
}));
jest.mock('@/core/store/route.store', () => ({
  useRouteStore: { getState: () => ({ van: null }) },
  getVanCategoryIds: () => ['C1'],
}));
jest.mock('@/shared/services/scheme.service', () => ({
  getApplicableSchemeRecords: async () => [],
}));

const mockTables: Record<string, any[]> = {
  products: [
    {
      productId: 'P1',
      name: 'Soap',
      categoryId: 'C1',
      casePrice: 10,
      piecePrice: 1,
      status: 'ACTIVE',
    },
    {
      productId: 'P2',
      name: 'Salt',
      categoryId: 'C1',
      casePrice: 20,
      piecePrice: 2,
      status: 'ACTIVE',
    },
  ],
  priceLists: [],
  stock: [
    { productId: 'P1', vanId: 'V-OTHER', quantity: 99 },
    { productId: 'P1', vanId: 'V1', quantity: 5 },
    { productId: 'P2', quantity: 7 },
  ],
};
const mockMakeRepo = (entity: string) => ({
  entity,
  findAll: jest.fn(async (_owner: string, { page = 1, limit = 200 } = {}) =>
    mockTables[entity].slice((page - 1) * limit, page * limit),
  ),
});
const mockRepos = {
  products: mockMakeRepo('products'),
  priceLists: mockMakeRepo('priceLists'),
  stock: mockMakeRepo('stock'),
  categories: mockMakeRepo('categories'),
};
jest.mock('@/repositories', () => ({
  get repositories() {
    return mockRepos;
  },
}));

import { productService } from '@/shared/services/product.service';

const fetchPage = () => productService.fetchProducts({ page: 1, limit: 10, vanId: 'V1' });

describe('offline product list caching', () => {
  beforeEach(() => Object.values(mockRepos).forEach((repo) => repo.findAll.mockClear()));

  it('loads products/prices once, but reads stock fresh on every fetch', async () => {
    mockOfflineState.lastSyncTime = 'sync-A';
    await fetchPage();
    await fetchPage();
    await fetchPage();

    expect(mockRepos.products.findAll).toHaveBeenCalledTimes(1);
    expect(mockRepos.priceLists.findAll).toHaveBeenCalledTimes(1);
    expect(mockRepos.stock.findAll).toHaveBeenCalledTimes(3);
  });

  it('reloads products after a sync download (watermark changes)', async () => {
    mockOfflineState.lastSyncTime = 'sync-B';
    await fetchPage();
    mockOfflineState.lastSyncTime = 'sync-C';
    await fetchPage();
    expect(mockRepos.products.findAll).toHaveBeenCalledTimes(2);
  });

  it('matches stock to the right van after indexing by product', async () => {
    mockOfflineState.lastSyncTime = 'sync-D';
    const res: any = await fetchPage();
    const byId = Object.fromEntries(res.data.map((p: any) => [p.productId, p.stock]));
    // P1: the V1 row, not the other van's 99. P2: van-less row as fallback.
    expect(byId).toEqual({ P1: 5, P2: 7 });
  });

  it('reflects local stock changes immediately (stock is never cached)', async () => {
    mockOfflineState.lastSyncTime = 'sync-E';
    await fetchPage();
    mockTables.stock[1].quantity = 4; // a sale reduced V1 stock locally
    const res: any = await fetchPage();
    expect(res.data.find((p: any) => p.productId === 'P1').stock).toBe(4);
  });
});
