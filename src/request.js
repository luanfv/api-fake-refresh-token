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

          const { token } = response.data;

          tokenCache = `Bearer ${token}`;
          api.defaults.headers.common.Authorization = tokenCache;

          const refreshRequest = await axios({
            ...error.config,
            headers: { Authorization: tokenCache },
          });

          resolve(refreshRequest);
        } catch {
          reject(error);
        }
      }

      reject(error);
    });
  },
);

async function run() {
  try {
    const responseWithoutToken = await api.get('/auth');
    console.log(
      'Authentication without valid token and with valid refresh token:',
      responseWithoutToken.data.message,
    );

    const responseWithToken = await api.get('/auth');
    console.log(
      'Authentication with valid token:',
      responseWithToken.data.message,
    );
  } catch (err) {
    console.log(err.response.data.message);
  }
}

run();
