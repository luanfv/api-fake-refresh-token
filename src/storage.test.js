import { storageRefreshToken, storageToken } from './storage';

describe('storage', () => {
  describe('storageRefreshToken', () => {
    it('should return refresh token', () => {
      const response = storageRefreshToken.get();
      const expected = 'refresh token';

      expect(response).toEqual(expected);
    });
  });

  describe('storageToken', () => {
    it('should save new token', () => {
      expect(() => storageToken.set('test')).not.toThrow();
    });
  });
});
