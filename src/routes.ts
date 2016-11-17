import * as express from 'express';

export default function (app: express.Application) {
    app.get('/', (req, res) => {
        res.send('Hello World!');
    })
}