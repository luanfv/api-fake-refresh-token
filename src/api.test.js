import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from './api';
import { storageRefreshToken } from './storage';

jest.mock('./storage');

describe('when requesting with Axios', () => {
  const mockApi = new MockAdapter(api);
  const mockAxios = new MockAdapter(axios);

  afterAll(() => {
    mockApi.restore();
    mockAxios.restore();
  });

  describe('when the token is valid', () => {
    beforeAll(() => {
      api.defaults.headers.common.Authorization = 'Bearer 123456';
      const expectedToken = 'Bearer 123456';

      mockApi.onGet('/auth').reply((config) => {
        return new Promise((resolve) => {
          if (expectedToken === config.headers.Authorization) {
            resolve([200, { message: 'authorized' }]);
          }

          resolve(401);
        });
      });

      mockApi.onPost('/todo').reply((config) => {
        return new Promise((resolve) => {
          if (expectedToken === config.headers.Authorization) {
            const body = JSON.parse(config.data);

            if (body && body.task) {
              resolve([
                201,
                {
                  id: 1,
                  task: body.task,
                },
              ]);
            }
          }

          resolve(401);
        });
      });
    });

    describe('when making a GET request', () => {
      it('should return status 200', async () => {
        const response = await api.get('/auth');

        expect(response.status).toEqual(200);
      });

      it('should return message authorized', async () => {
        const expectedResponse = { message: 'authorized' };
        const response = await api.get('/auth');

        expect(response.data).toEqual(expectedResponse);
      });
    });

    describe('when making a POST request', () => {
      it('should return status 201', async () => {
        const response = await api.post('/todo', { task: 'test' });

        expect(response.status).toEqual(201);
      });

      it('should return new task', async () => {
        const expectedResponse = {
          id: 1,
          task: 'test',
        };

        const response = await api.post('/todo', { task: 'test' });

        expect(response.data).toEqual(expectedResponse);
      });
    });
  });

  describe('when the token expires or is invalid', () => {
    describe('when has a valid refresh token', () => {
      storageRefreshToken.get.mockImplementation(() => 'abcd');

      const expectedRefreshToken = 'abcd';
      const expectedToken = 'Bearer 123456';

      beforeEach(() => {
        api.defaults.headers.common.Authorization = '';
      });

      beforeAll(() => {
        mockApi.onPost('/refresh-token').reply((config) => {
          return new Promise((resolve) => {
            const responseRefreshToken = JSON.parse(config.data).refresh_token;

            if (responseRefreshToken === expectedRefreshToken) {
              resolve([200, { token: '123456' }]);
            }

            resolve([400]);
          });
        });

        mockApi.onPost('/todo').reply((config) => {
          return new Promise((resolve) => {
            if (expectedToken === config.headers.Authorization) {
              const body = JSON.parse(config.data);

              if (body && body.task) {
                resolve([
                  201,
                  {
                    id: 1,
                    task: body.task,
                  },
                ]);
              }
            }

            resolve([401, { message: 'unauthorized' }]);
          });
        });

        mockApi.onGet('/auth').reply(401, { message: 'unauthorized' });
      });

      describe('when the refresh request is successful', () => {
        beforeAll(() => {
          mockAxios.onGet('/auth').reply((config) => {
            return new Promise((resolve) => {
              if (expectedToken === config.headers.Authorization) {
                resolve([200, { message: 'authorized' }]);
              }

              resolve([500]);
            });
          });

          mockAxios.onPost('/todo').reply((config) => {
            return new Promise((resolve) => {
              if (expectedToken === config.headers.Authorization) {
                const body = JSON.parse(config.data);

                if (body && body.task) {
                  resolve([
                    201,
                    {
                      id: 1,
                      task: body.task,
                    },
                  ]);
                }
              }

              resolve([500]);
            });
          });
        });

        describe('when making a GET request', () => {
          it('should return status 200', async () => {
            const response = await api.get('/auth');

            expect(response.status).toEqual(200);
          });

          it('should return message authorized', async () => {
            const expectedResponse = { message: 'authorized' };
            const response = await api.get('/auth');

            expect(response.data).toEqual(expectedResponse);
          });
        });

        describe('when making a POST request', () => {
          it('should return status 201', async () => {
            const response = await api.post('/todo', { task: 'test' });

            expect(response.status).toEqual(201);
          });

          it('should return new task', async () => {
            const expectedResponse = {
              id: 1,
              task: 'test',
            };

            const response = await api.post('/todo', { task: 'test' });

            expect(response.data).toEqual(expectedResponse);
          });
        });
      });

      describe('when the refresh request fails', () => {
        beforeAll(() => {
          mockAxios.onGet('/auth').reply(500);

          mockAxios.onPost('/todo').reply(500);
        });

        describe('when making a GET request', () => {
          it('should return status 401', async () => {
            try {
              await api.get('/auth');

              expect(1).toEqual(0);
            } catch (err) {
              expect(err.response.status).toEqual(401);
            }
          });

          it('should return message unauthorized', async () => {
            const expectedResponse = { message: 'unauthorized' };

            try {
              await api.get('/auth');

              expect(1).toEqual(0);
            } catch (err) {
              expect(err.response.data).toEqual(expectedResponse);
            }
          });
        });

        describe('when making a POST request', () => {
          it('should return status 401', async () => {
            try {
              await api.post('/todo', { task: 'test' });

              expect(1).toEqual(0);
            } catch (err) {
              expect(err.response.status).toEqual(401);
            }
          });

          it('should return message unauthorized', async () => {
            const expectedResponse = { message: 'unauthorized' };

            try {
              await api.post('/todo', { task: 'test' });

              expect(1).toEqual(0);
            } catch (err) {
              expect(err.response.data).toEqual(expectedResponse);
            }
          });
        });
      });
    });

    describe('when has a invalid refresh token', () => {});
  });

  describe('when the request fails', () => {});
});
