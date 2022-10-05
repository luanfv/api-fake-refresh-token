import 'dotenv/config';

import axios from 'axios';
import { storageRefreshToken, storageToken } from '../utils/storage';

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

async function refreshRequest(requestConfig, refreshToken) {
  const refreshTokenResponse = await axios.post(
    requestConfig.baseURL + ROUTE_POST_REFRESH_TOKEN,
    {
      refresh_token: refreshToken,
    },
  );

  const token = `Bearer ${refreshTokenResponse.data.token}`;

  const data = requestConfig.data ? JSON.parse(requestConfig.data) : null;

  const refreshResponse = await axios.request({
    ...requestConfig,
    data,
    headers: { Authorization: token },
  });

  return {
    token,
    response: refreshResponse,
  };
}

function setApiToken(value) {
  api.defaults.headers.common.Authorization = value;
  storageToken.set(value);
}

export { api, setApiToken };
