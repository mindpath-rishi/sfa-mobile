jest.mock('@/core/network/http-client', () => ({
  BASE_URL: 'https://order.tradekings.app:4001/api/v1',
}));

import { resolveMediaUrl } from '@/shared/utils/media-url.utils';

describe('resolveMediaUrl', () => {
  it('prefixes server-relative upload paths with the API origin (not /api/v1)', () => {
    expect(resolveMediaUrl('/uploads/media/selfie.jpg')).toBe(
      'https://order.tradekings.app:4001/uploads/media/selfie.jpg',
    );
    expect(resolveMediaUrl('uploads/media/selfie.jpg')).toBe(
      'https://order.tradekings.app:4001/uploads/media/selfie.jpg',
    );
  });

  it('leaves absolute and on-device URIs unchanged', () => {
    for (const uri of [
      'https://res.cloudinary.com/x/image.jpg',
      'http://10.0.2.2:3000/uploads/a.jpg',
      'file:///data/user/0/app/cache/a.jpg',
      'content://media/external/images/1',
      'data:image/png;base64,AAAA',
    ]) {
      expect(resolveMediaUrl(uri)).toBe(uri);
    }
  });

  it('returns undefined for empty values', () => {
    expect(resolveMediaUrl(undefined)).toBeUndefined();
    expect(resolveMediaUrl(null)).toBeUndefined();
    expect(resolveMediaUrl('')).toBeUndefined();
  });
});
