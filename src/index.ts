import * as _ from 'lodash';
import { createApp } from './app';
import { Logger } from './logger';
import { Config } from './models/config';

const logger = new Logger(__filename);

const config: Config = require('../config'); // tslint:disable-line

async function startServer(cfg: Config) {
  const app = await createApp(cfg);

  // Start server
  app.listen(cfg.port, cfg.hostname, () => {
    logger.info('Server start', { host: cfg.hostname, port: _.toString(cfg.port) });
  });
}

startServer(config);
