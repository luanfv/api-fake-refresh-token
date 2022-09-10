import 'dotenv/config';

import axios from 'axios';

let tokenCache = '';

const api = axios.create({
  baseURL: `${process.env.BASE_URL}:${process.env.PORT}`,
});

api.defaults.headers.common.Authorization = tokenCache;

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (error.response.status === 401) {
        try {
          const response = await api.post('/refresh-token', {
            refresh_token: process.env.REFRESH_TOKEN,
          });

          tokenCache = `Bearer ${response.data.token}`;
          api.defaults.headers.common.Authorization = tokenCache;

          const refreshRequest = error.config.data
            ? JSON.parse(error.config.data)
            : null;

          const refreshResponse = await axios({
            ...error.config,
            data: refreshRequest,
            headers: { Authorization: tokenCache },
          });

          resolve(refreshResponse);
        } catch {
          reject(error);
        }
      }

      reject(error);
    });
  },
);

async function requestAuth() {
  try {
    const responseWithoutToken = await api.get('/auth');
    console.log(
      'Authentication without valid token and with valid refresh token:',
      responseWithoutToken.data,
    );

    const responseWithToken = await api.get('/auth');
    console.log('Authentication with valid token:', responseWithToken.data);
  } catch (err) {
    console.log(err.response.data.message);
  }
}

async function requestTODO() {
  try {
    const responseWithoutToken = await api.post('/todo', { task: 'teste 1' });
    console.log(
      'Create TODO without valid token and with valid refresh token:',
      responseWithoutToken.data,
    );

    const responseWithToken = await api.post('/todo', { task: 'teste 2' });
    console.log('Create TODO with valid token:', responseWithToken.data);
  } catch (err) {
    console.log(err.response.data.message);
  }
}

async function main() {
  tokenCache = '';
  api.defaults.headers.common.Authorization = tokenCache;
  await requestAuth();

  tokenCache = '';
  api.defaults.headers.common.Authorization = tokenCache;
  await requestTODO();
}

main();
