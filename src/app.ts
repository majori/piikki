import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as methodOverride from 'method-override';
import * as cors from 'cors';

import { handleTokens, initTokens } from './tokenHandler';
import { errorResponder } from './errors';
import { initApiRoutes } from './router';
import swagger from './swagger';

import { Config } from './types/config';

export async function createApp(cfg: Config) {
  const app = express();

  // 3rd party middleware
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cors(cfg.cors));
  app.options('*', cors(cfg.cors));

  // Set request start time
  app.use((req, res, next) => {
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
