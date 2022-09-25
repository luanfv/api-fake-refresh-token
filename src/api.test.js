import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from './api';
import { storageRefreshToken } from './storage';

jest.mock('./storage');

describe('Request interceptors', () => {
  const mockApi = new MockAdapter(api);
  const mockAxios = new MockAdapter(axios);
  const expectedToken = 'Bearer 123456';
  const expectedRefreshToken = 'abcd';
  const baseURL = api.defaults.baseURL;

  beforeAll(() => {
    mockApi.onGet('/auth').reply((config) => {
      return new Promise((resolve) => {
        if (expectedToken === config.headers.Authorization) {
          resolve([200]);
        }

        resolve([500]);
      });
    });

    mockApi.onPost('/todo').reply((config) => {
      return new Promise((resolve) => {
        if (expectedToken === config.headers.Authorization) {
          resolve([201]);
        }

        resolve([500]);
      });
    });

    mockAxios.onPost(`${baseURL}/refresh-token`).reply((config) => {
      return new Promise((resolve) => {
        const responseRefreshToken = JSON.parse(config.data).refresh_token;

        if (responseRefreshToken === expectedRefreshToken) {
          resolve([200, { token: '123456' }]);
        }

        resolve([400]);
      });
    });

    mockAxios.onGet(`${baseURL}/auth`).reply((config) => {
      return new Promise((resolve) => {
        if (expectedToken === config.headers.Authorization) {
          resolve([200]);
        }

        resolve([500]);
      });
    });

    mockAxios.onPost(`${baseURL}/todo`).reply((config) => {
      return new Promise((resolve) => {
        if (expectedToken === config.headers.Authorization) {
          resolve([201]);
        }

        resolve([500]);
      });
    });
  });

  afterAll(() => {
    mockApi.restore();
    mockAxios.restore();
  });

  beforeEach(() => {
    jest.spyOn(api, 'get');
    jest.spyOn(api, 'post');
    jest.spyOn(axios, 'get');
    jest.spyOn(axios, 'post');
    jest.spyOn(axios, 'request');

    api.defaults.headers.common.Authorization = '';
    storageRefreshToken.get.mockImplementation(() => 'abcd');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the token is valid', () => {
    beforeEach(() => {
      api.defaults.headers.common.Authorization = 'Bearer 123456';
    });

    describe('when making a request without body', () => {
      it('should successful request', async () => {
        const response = await api.get('/auth');

        expect(response.status).toEqual(200);
      });

      it('should not request refresh token', async () => {
        await api.get('/auth');

        expect(axios.post).not.toBeCalledWith(`${baseURL}/refresh-token`, {
          refresh_token: 'abcd',
        });
      });

      it('should not refresh request', async () => {
        await api.get('/auth');

        expect(axios.request).not.toHaveBeenCalled();
      });
    });

    describe('when making a request with body', () => {
      it('should successful request', async () => {
        const response = await api.post('/todo', { task: 'test' });

        expect(response.status).toEqual(201);
      });

      it('should not request refresh token', async () => {
        await api.post('/todo', { task: 'test' });

        expect(axios.post).not.toBeCalledWith(`${baseURL}/refresh-token`, {
          refresh_token: 'abcd',
        });
      });

      it('should not refresh request', async () => {
        await api.post('/todo', { task: 'test' });

        expect(axios.request).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the token expires or is invalid', () => {
    describe('when has a valid refresh token', () => {
      beforeAll(() => {
        mockApi.onPost('/todo').reply(401);
        mockApi.onGet('/auth').reply(401);
      });

      describe('when the refresh request is successful', () => {
        describe('when making a request without body', () => {
          it('should successful request', async () => {
            const response = await api.get('/auth');

            expect(response.status).toEqual(200);
          });

          it('should request refresh token', async () => {
            await api.get('/auth');

            expect(axios.post).toBeCalledWith(`${baseURL}/refresh-token`, {
              refresh_token: 'abcd',
            });
          });

          it('should refresh request', async () => {
            await api.get('/auth');

            expect(axios.request).toHaveBeenCalled();
          });
        });

        describe('when making a request with body', () => {
          it('should successful request', async () => {
            const response = await api.post('/todo', { task: 'test' });

            expect(response.status).toEqual(201);
          });

          it('should request refresh token', async () => {
            await api.post('/todo', { task: 'test' });

            expect(axios.post).toBeCalledWith(`${baseURL}/refresh-token`, {
              refresh_token: 'abcd',
            });
          });

          it('should refresh request', async () => {
            await api.post('/todo', { task: 'test' });

            expect(axios.request).toHaveBeenCalled();
          });
        });
      });

      describe('when the refresh request fails', () => {
        beforeAll(() => {
          mockAxios.onGet(`${baseURL}/auth`).reply(500);
        });

        it('should failed request', async () => {
          try {
            await api.get('/auth');

            expect(1).toEqual(0);
          } catch (err) {
            expect(err.response.status).toEqual(401);
          }
        });

        it('should request refresh token', async () => {
          try {
            await api.get('/auth');

            expect(1).toEqual(0);
          } catch {
            expect(axios.post).toBeCalledWith(`${baseURL}/refresh-token`, {
              refresh_token: 'abcd',
            });
          }
        });

        it('should refresh request', async () => {
          try {
            await api.get('/auth');

            expect(1).toEqual(0);
          } catch {
            expect(axios.request).toHaveBeenCalled();
          }
        });
      });
    });

    describe('when has a invalid refresh token', () => {
      beforeAll(() => {
        mockApi.onPost('/refresh-token').reply(500);
      });

      beforeEach(() => {
        storageRefreshToken.get.mockImplementation(() => 'invalid');
      });

      it('should failed request', async () => {
        try {
          await api.get('/auth');

          expect(1).toEqual(0);
        } catch (err) {
          expect(err.response.status).toEqual(401);
        }
      });

      it('should request refresh token', async () => {
        try {
          await api.get('/auth');

          expect(1).toEqual(0);
        } catch {
          expect(axios.post).toBeCalledWith(`${baseURL}/refresh-token`, {
            refresh_token: 'invalid',
          });
        }
      });

      it('should not refresh request', async () => {
        try {
          await api.get('/auth');

          expect(1).toEqual(0);
        } catch {
          expect(axios.request).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('when the request fails', () => {
    beforeAll(() => {
      mockApi.onGet('/auth').reply(500);
    });

    it('should failed request', async () => {
      try {
        await api.get('/auth');

        expect(1).toEqual(0);
      } catch (err) {
        expect(err.response.status).toEqual(500);
      }
    });

    it('should not request refresh token', async () => {
      try {
        await api.get('/auth');

        expect(1).toEqual(0);
      } catch {
        expect(axios.post).not.toHaveBeenCalled();
      }
    });

    it('should not refresh request', async () => {
      try {
        await api.get('/auth');

        expect(1).toEqual(0);
      } catch {
        expect(axios.request).not.toHaveBeenCalled();
      }
    });
  });
});
