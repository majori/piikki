import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from 'http';
import * as methodOverride from 'method-override';
import { toString } from 'lodash';
import appInsights = require('applicationinsights');

import { handleTokens, initTokens } from './tokenHandler';
import { initApiRoutes } from './router';

// Extend Express own request object with additional info
export interface IExtendedRequest extends Request {
    piikki: {
        token: {
            token: string,
            role: string,
            group_name: string;
        },
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
    app.use('/api/v1', initApiRoutes());

    // Error responder
    app.use((err: any, req: IExtendedRequest, res: Response, next: NextFunction) => {
        const status = err.status ? err.status : 500;

        let response = {
            ok: false,
            error: {
                type: (status < 500) ? err.name : STATUS_CODES[status],
                message: (status < 500) ? err.message : '',
            },
        };

        // Track error response
        appInsights.client.trackRequest(req, res, { response: JSON.stringify(response) });

        res.status(status).send(response);
    });

    return app;
};
