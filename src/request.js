const axios = require('axios');

const REFRESH_TOKEN = 'refresh token';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return new Promise(async (resolve, reject) => {
      if (error.response.status === 401) {
        try {
          const response = await api.post('/refresh-token', {
            refresh_token: REFRESH_TOKEN,
          });

          const { token } = response.data;

          api.defaults.headers.common.Authorization = `Bearer ${token}`;

          const refreshRequest = await axios({
            ...error.config,
            headers: { Authorization: token },
          });

          resolve(refreshRequest);
        } catch {
          reject(error);
        }
      }

      reject(error);
    });
  }
);

api
  .get('/auth')
  .then((response) => console.log('SUCCESS:', response.data))
  .catch(() => console.log('FAILURE'));

// api
//   .post('/refresh-token', { refresh_token: 'refresh token' })
//   .then((response) => console.log('SUCCESS:', response.data))
//   .catch(() => console.log('FAILURE'));
