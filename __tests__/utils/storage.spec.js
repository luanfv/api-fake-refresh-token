import { storageRefreshToken, storageToken } from '../../src/utils/storage';

describe('storageRefreshToken', () => {
  describe('get', () => {
    it('should return refresh token', () => {
      const response = storageRefreshToken.get();
      const expected = 'refresh token';

      expect(response).toEqual(expected);
    });
  });
});

describe('storageToken', () => {
  describe('set', () => {
    it('should save new token', () => {
      expect(() => storageToken.set('test')).not.toThrow();
    });
  });
});
