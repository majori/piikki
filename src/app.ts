import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';
import * as express from 'express';
import * as methodOverride from 'method-override';
import * as appInsights from 'applicationinsights';
import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from 'http';
import { toString } from 'lodash';

import { handleTokens, initTokens } from './tokenHandler';
import { errorResponder } from './errors';
import { initApiRoutes } from './router';
import { IDatabaseToken } from './database';
import swagger from './swagger';

// Extend Express own request object with additional info
export interface IExtendedRequest extends Request {
  insights: {
    startTime: number;
  };

  piikki: {
    token: IDatabaseToken;
    groupAccess: {
      all: boolean;
      group: {
        name: string | null;
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

  // Setup Application Insights
  const insights = appInsights
    .setup(cfg.appInsightsKey || 'gibberish')
    .setAutoCollectRequests(false)
    .setAutoCollectPerformance(false)
    .setAutoCollectExceptions(false)
    .setAutoCollectConsole(false);

  // Start Insights only if the key is defined
  if (cfg.appInsightsKey) {
    insights.start();
  }

  // Set request start time
  app.use((req: IExtendedRequest, res, next) => {
    // Set response start time
    req.insights = { startTime: Date.now() };
    next();
  });

  // Setup API definitions (swagger)
  app.use('/swagger', swagger(cfg));

  // Register currently used tokens
  initTokens();

  // Authorize request
  app.use(handleTokens);

  // Initialize routes
  app.use('/api/v1', initApiRoutes());

  // Setup error responder
  app.use(errorResponder);

  return app;
}
