import 'dotenv/config';

const storageRefreshToken = {
  get: () => {
    return process.env.REFRESH_TOKEN;
  },
};

const storageToken = {
  get: () => {},
  set: (value) => {
    console.log(`UPDATE STORAGE TOKEN:`, value);
  },
};

export { storageToken, storageRefreshToken };
