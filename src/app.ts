import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';
import * as express from 'express';
import * as http from 'http';
import * as methodOverride from 'method-override';

import { createRouter } from './router';

export function createApp(cfg: any) {
    const app = express();

    // Use dev middlewares
    if (!cfg.isProduction) {
        app.use(errorHandler());
    }

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // Authorize request
    app.use((req, res, next) => {
        let auth = req.get('Authorization');

        if (auth && auth === cfg.secret) {
            next();
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    });

    // Initialize routes
    const router = createRouter();
    app.use('/api', router);

    app.use((err: any, req, res, next) => {
        const status = err.status ? err.status : 500;

        if (status >= 400) {
            console.error('Request headers:');
            console.error(JSON.stringify(req.headers));
            console.error('Request parameters:');
            console.error(JSON.stringify(req.params));
        }

        next(err);
    });

    // Error responder
    app.use((err: any, req, res, next) => {
        const status = err.status ? err.status : 500;
        const httpMessage = http.STATUS_CODES[status];

        let message = (status < 500) ? httpMessage + ': ' + err.message : httpMessage;

        let response = {
            ok: false,
            message
        };

        res.status(status);
        res.send(response);
    });

    return app;
};
