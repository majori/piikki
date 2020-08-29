import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as methodOverride from 'method-override';
import * as cors from 'cors';
import { isBoom } from 'boom';
import { knex } from './database';
import swaggerJSDoc = require('swagger-jsdoc');
import swaggerUi = require('swagger-ui-express');

import { handleTokens, initTokens } from './tokenHandler';
import { initApiRoutes } from './router';
import { Logger } from './logger';
import { IConfig } from './types/config';

const logger = new Logger(__filename);

export async function createServer(cfg: IConfig) {
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
  const spec = swaggerJSDoc(cfg.swagger);
  app.get('/api-doc.json', (req, res) => res.json(spec));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

  // Health endpoint
  app.get('/health', async (req, res) => {
    try {
      await knex.raw('SELECT 1');
      res.send('ok');
    } catch (err) {
      res.status(500);
    }
  });

  // Register currently used tokens
  await initTokens();

  // Authorize request
  app.use(handleTokens);

  // Initialize API routes
  app.use('/api/v1', initApiRoutes());

  // Setup error responder
  const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
    const status = isBoom(err) ? err.output.statusCode : 500;
    const payload = isBoom(err)
      ? err.output.payload
      : { error: 'Internal Server Error', message: '' };

    const response = {
      ok: false,
      error: {
        type: payload.error,
        message: payload.message,
        details: err.data,
      },
    };

    // Set response status
    res.status(status);

    // Log error request
    logger.errorRequest(req, res, err);

    res.send(response);
  };

  app.use(errorHandler);

  return app;
}
