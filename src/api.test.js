import { api } from './api';

jest.mock('./api');

describe('when requesting the API with Axios', () => {
  describe('when the token has not expired', () => {
    describe('when making a GET request', () => {
      let response;

      beforeAll(async () => {
        api.get.mockImplementation(() =>
          Promise.resolve({
            status: 200,
            data: {
              message: 'authorized',
            },
          }),
        );

        response = await api.get('/auth');
      });

      afterAll(() => {
        api.mockClear();
      });

      it('should return status 200', async () => {
        expect(response.status).toEqual(200);
      });

      it('should return message authorized', async () => {
        const expectedResponse = { message: 'authorized' };

        expect(response.data).toEqual(expectedResponse);
      });
    });

    describe('when making a POST request', () => {
      beforeAll(async () => {
        api.post.mockImplementation((route, body) => {
          console.log(route, body);

          if (route === '/todo') {
            if (body && body.task) {
              return Promise.resolve({
                status: 201,
                data: {
                  id: 1,
                  task: body.task,
                },
              });
            }
          }

          return new Promise.reject();
        });
      });

      afterAll(() => {
        api.mockClear();
      });

      it('should return status 201', async () => {
        const response = await api.post('/todo', { task: 'test' });

        expect(response.status).toEqual(201);
      });

      it('should return new task', async () => {
        const response = await api.post('/todo', { task: 'test' });
        const expectedResponse = {
          id: 1,
          task: 'test',
        };

        expect(response.data).toEqual(expectedResponse);
      });
    });
  });

  describe('when the token expires but has a valid refresh token', () => {});

  describe("when the token expires but doesn't have a valid refresh token", () => {});
});
