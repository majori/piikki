import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';
import * as express from 'express';
import * as methodOverride from 'method-override';
import * as appInsights from 'applicationinsights';
import * as cors from 'cors';
import { Request, Response, NextFunction } from 'express';

import { handleTokens, initTokens } from './tokenHandler';
import { errorResponder } from './errors';
import { initApiRoutes } from './router';
import swagger from './swagger';

import { DatabaseToken } from './models/database';
import { IExtendedRequest } from './models/http';
import { Config } from './models/config';

export async function createApp(cfg: Config) {
  const app = express();

  // 3rd party middleware
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cors(cfg.cors));
  app.options('*', cors(cfg.cors));

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
  await initTokens();

  // Authorize request
  app.use(handleTokens);

  // Initialize API routes
  app.use('/api/v1', initApiRoutes());

  // Setup error responder
  app.use(errorResponder);

  return app;
}
