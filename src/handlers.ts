import * as express from 'express';
const cfg = require('../config');

export default (app: express.Application) => {

    app.use((req, res, next) => {
        let auth = req.get('Authorization');

        if (auth && auth === cfg.secret) {
            next();
        } else {
            res.status(401).send('Unauthorized');
        }
    });

};
