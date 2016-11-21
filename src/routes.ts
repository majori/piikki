import * as express from 'express';
import db from './database';

export default (app: express.Application) => {
    app.get('/', (req, res) => {
        res.send('Hello World!');
    })
}