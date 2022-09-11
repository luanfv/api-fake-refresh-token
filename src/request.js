import 'dotenv/config';

import { api, setApiToken } from './api';

async function requestAuth() {
  try {
    const responseWithoutToken = await api.get(process.env.ROUTE_GET_AUTH);
    console.log(
      'Authentication without valid token and with valid refresh token:',
      responseWithoutToken.data,
    );

    const responseWithToken = await api.get(process.env.ROUTE_GET_AUTH);
    console.log('Authentication with valid token:', responseWithToken.data);
  } catch (err) {
    console.log(err.response.data.message);
  }
}

async function requestTODO() {
  try {
    const responseWithoutToken = await api.post(process.env.ROUTE_POST_TODO, {
      task: 'teste 1',
    });
    console.log(
      'Create TODO without valid token and with valid refresh token:',
      responseWithoutToken.data,
    );

    const responseWithToken = await api.post(process.env.ROUTE_POST_TODO, {
      task: 'teste 2',
    });
    console.log('Create TODO with valid token:', responseWithToken.data);
  } catch (err) {
    console.log(err.response.data.message);
  }
}

async function main() {
  setApiToken(null);
  await requestAuth();

  setApiToken(null);
  await requestTODO();
}

main();
