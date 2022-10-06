import 'dotenv/config';

import axios from 'axios';

import { storageRefreshToken, storageToken } from '../utils/storage';
import { refreshRequest } from '../utils/request';

const BASE_URL = `${process.env.BASE_URL}:${process.env.PORT}`;

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return new Promise(async (resolve, reject) => {
      switch (error.response.status) {
        case 401:
          const refreshToken = storageRefreshToken.get();

          if (refreshToken) {
            try {
              const { token, response } = await refreshRequest(
                error.config,
                refreshToken,
              );

              setApiToken(token);
              resolve(response);
            } catch (err) {
              if (err.response.status === 401) {
                setApiToken(null);
              }
            }
          }

          break;

        default:
          break;
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
