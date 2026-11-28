jest.mock('@/core/store/auth.store', () => ({
  useAuthStore: { getState: () => ({ accessToken: null }) },
}));
jest.mock('@/shared/services/tokenStorage', () => ({ getAccessToken: async () => null }));

import { uploadFormData } from '@/core/network/upload';

const respond = (status: number, body: unknown) =>
  jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  });

describe('uploadFormData', () => {
  afterEach(() => {
    (global as any).fetch = undefined;
  });

  it('returns the uploaded media on success', async () => {
    global.fetch = respond(201, {
      statusCode: 201,
      data: { mediaId: 'MID1', url: '/uploads/a.jpg' },
    });
    const res = await uploadFormData<any>('/media/upload', new FormData());
    expect(res).toMatchObject({ success: true, statusCode: 201, data: { mediaId: 'MID1' } });
  });

  it('keeps the server payload on errors, e.g. the existing media for a duplicate upload', async () => {
    global.fetch = respond(400, {
      success: false,
      statusCode: 400,
      message: 'Media already exists',
      data: { mediaId: 'MID1', url: '/uploads/a.jpg' },
    });
    const res = await uploadFormData<any>('/media/upload', new FormData());
    expect(res.success).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.message).toBe('Media already exists');
    expect(res.data).toEqual({ mediaId: 'MID1', url: '/uploads/a.jpg' });
  });

  it('returns null data for errors without a payload or for network failures', async () => {
    global.fetch = respond(500, { message: 'boom' });
    expect((await uploadFormData<any>('/media/upload', new FormData())).data).toBeNull();

    global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));
    const res = await uploadFormData<any>('/media/upload', new FormData());
    expect(res).toMatchObject({ success: false, statusCode: 0, data: null });
  });
});
