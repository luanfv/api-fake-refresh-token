import 'dotenv/config';

const storageRefreshToken = {
  get: () => {
    return process.env.REFRESH_TOKEN;
  },
};

const storageToken = {
  set: (value) => value,
};

export { storageToken, storageRefreshToken };
