import 'dotenv/config';

import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.BASE_URL}:${process.env.PORT}`,
});

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

          const token = `Bearer ${response.data.token}`;
          api.defaults.headers.common.Authorization = token;
          // SAVE TOKEN IN CACHE

          const refreshRequest = error.config.data
            ? JSON.parse(error.config.data)
            : null;

          const refreshResponse = await axios({
            ...error.config,
            data: refreshRequest,
            headers: { Authorization: token },
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

export { api };
