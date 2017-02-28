import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as http from 'http';
import * as methodOverride from 'method-override';

import { handleTokens, initTokens } from './tokenHandler';
import { initApiRoutes } from './router';

// Extend Express own request object with additional info
export interface IExtendedRequest extends Request {
    piikki: {
        groupAccess: {
            all: boolean;
            group: {
                name: string;
            },
        },
        admin: {
            isAdmin: boolean;
        },
    };
}

export function createApp(cfg: any) {
    const app = express();

    // 3rd party middleware
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // Register currently used tokens
    initTokens();

    // Authorize request
    app.use(handleTokens);

    // Initialize routes
    app.use('/api', initApiRoutes());

    // Error logger
    app.use((err: any, req: IExtendedRequest, res: Response, next: NextFunction) => {
        const status = err.status ? err.status : 500;

        if (status >= 401) {
            console.error(err);
            console.error('Request headers:');
            console.error(JSON.stringify(req.headers));
            console.error('Request parameters:');
            console.error(JSON.stringify(req.params));
        }

        next(err);
    });

    // Error responder
    app.use((err: any, req: IExtendedRequest, res: Response, next: NextFunction) => {
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
