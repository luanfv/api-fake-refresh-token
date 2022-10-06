import 'dotenv/config';

import axios from 'axios';

const ROUTE_POST_REFRESH_TOKEN = process.env.ROUTE_POST_REFRESH_TOKEN;

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

export { refreshRequest };
