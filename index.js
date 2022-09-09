const express = require('express');
const bodyParser = require('body-parser');

const TOKEN = 'Bearer 123456';
const REFRESH_TOKEN = 'refresh token';

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/auth', (req, res) => {
    try {
        const token = req.headers.authorization;

        if (token !== TOKEN) {
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

        if (refresh_token !== REFRESH_TOKEN) {
            res.status(404).json({
                message: 'refresh token not exists',
            });
        }

        res.json({
            token: TOKEN,
        });
    } catch {
        res.status(400).json({
            message: 'failure',
        });
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
