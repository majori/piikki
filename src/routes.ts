import * as express from 'express';
import * as _ from 'lodash';
import * as db from './database';

export default (app: express.Application) => {

    let response: any = { ok: true };

    app.get('/', (req, res, next) => {
        response.message = 'Hello world!';
        next();
    });

    app.use((req, res, next) => {
        res.json(response);
    });
}