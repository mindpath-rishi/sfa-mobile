import { getCachedScreenData, queryClient, setCachedScreenData } from '@/shared/providers/queryClient';

describe('screen stale-while-revalidate cache', () => {
  afterEach(() => queryClient.clear());

  it('returns what was stored for the same key and nothing for other keys/users', () => {
    setCachedScreenData(['routeOutlets', 'U1', 'R1', 'RS1'], { data: [{ _id: 'O1' }] });

    expect(getCachedScreenData(['routeOutlets', 'U1', 'R1', 'RS1'])).toEqual({ data: [{ _id: 'O1' }] });
    expect(getCachedScreenData(['routeOutlets', 'U2', 'R1', 'RS1'])).toBeUndefined();
    expect(getCachedScreenData(['routeOutlets', 'U1', 'R2', 'RS1'])).toBeUndefined();
  });

  it('keys product pages by the full request params', () => {
    setCachedScreenData(['products', 'U1', 'sales', { page: 1, searchText: 'soap' }], { total: 1 });
    expect(getCachedScreenData(['products', 'U1', 'sales', { page: 1, searchText: 'soap' }])).toEqual({ total: 1 });
    expect(getCachedScreenData(['products', 'U1', 'sales', { page: 1, searchText: 'salt' }])).toBeUndefined();
  });

  it('keeps entries for 30 minutes of inactivity (not the 5 minute default)', () => {
    setCachedScreenData(['vanStock', 'U1', 'V1'], { total: 3 });
    const query = queryClient.getQueryCache().find({ queryKey: ['screen', 'vanStock', 'U1', 'V1'] });
    expect(query?.options.gcTime).toBe(30 * 60_000);
  });

  it('is emptied by queryClient.clear() (called on logout)', () => {
    setCachedScreenData(['vanStock', 'U1', 'V1'], { total: 3 });
    queryClient.clear();
    expect(getCachedScreenData(['vanStock', 'U1', 'V1'])).toBeUndefined();
  });
});
