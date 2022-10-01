import 'dotenv/config';

import axios from 'axios';
import { storageRefreshToken, storageToken } from './storage';

const ROUTE_POST_REFRESH_TOKEN = process.env.ROUTE_POST_REFRESH_TOKEN;
const BASE_URL = `${process.env.BASE_URL}:${process.env.PORT}`;

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (error.response && error.response.status === 401) {
        const refreshToken = storageRefreshToken.get();

        if (refreshToken) {
          try {
            const refreshTokenResponse = await axios.post(
              error.config.baseURL + ROUTE_POST_REFRESH_TOKEN,
              {
                refresh_token: refreshToken,
              },
            );

            const token = `Bearer ${refreshTokenResponse.data.token}`;

            const refreshRequest = error.config.data
              ? JSON.parse(error.config.data)
              : null;

            const refreshResponse = await axios.request({
              ...error.config,
              data: refreshRequest,
              headers: { Authorization: token },
            });

            setApiToken(token);
            resolve(refreshResponse);
          } catch (err) {
            if (err.response.status === 401) {
              setApiToken(null);
            }
          }
        }
      }

      reject(error);
    });
  },
);

function setApiToken(value) {
  api.defaults.headers.common.Authorization = value;
  storageToken.set(value);
}

export { api, setApiToken };
