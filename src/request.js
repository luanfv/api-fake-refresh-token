import { api } from './api';

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
  api.defaults.headers.common.Authorization = '';
  await requestAuth();

  api.defaults.headers.common.Authorization = '';
  await requestTODO();
}

main();
