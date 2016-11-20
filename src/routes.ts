import * as express from 'express';

export default (app: express.Application) => {
    app.get('/', (req, res) => {
        res.send('Hello World!');
    })
}