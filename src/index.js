import 'dotenv/config';

import express from 'express';
import { json } from 'body-parser';

const app = express();

app.use(json());

app.get('/auth', (req, res) => {
  try {
    const token = req.headers.authorization;

    if (token !== process.env.TOKEN) {
      throw new Error();
    }

    res.json({
      message: 'AUTH success',
    });
  } catch {
    res.status(401).json({
      message: 'AUTH failure',
    });
  }
});

app.post('/refresh-token', (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (refresh_token !== process.env.REFRESH_TOKEN) {
      throw new Error();
    }

    res.json({
      token: process.env.TOKEN,
    });
  } catch {
    res.status(401).json({
      message: 'REFRESH TOKEN failure',
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});
