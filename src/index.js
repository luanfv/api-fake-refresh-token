import express from 'express';
import { json } from 'body-parser';
import env from 'dotenv';

const app = express();

app.use(json());

app.get('/auth', (req, res) => {
  try {
    const token = req.headers.authorization;

    if (token !== env.TOKEN) {
      res.status(404).json({
        message: 'token not exists',
      });
    }

    res.json({
      message: 'success',
    });
  } catch {
    res.status(400).json({
      message: 'failure',
    });
  }
});

app.post('/refresh-token', (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (refresh_token !== env.REFRESH_TOKEN) {
      res.status(404).json({
        message: 'refresh token not exists',
      });
    }

    res.json({
      token: env.TOKEN,
    });
  } catch {
    res.status(400).json({
      message: 'failure',
    });
  }
});

app.listen(env.POT, () => {
  console.log(`App listening on port ${env.PORT}`);
});
