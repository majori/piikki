import * as process from 'process';
import * as _ from 'lodash';
import { createServer } from './server';
import { Logger } from './logger';
import { Config } from './types/config';

const logger = new Logger(__filename);

const config: Config = require('../config'); // tslint:disable-line

async function startServer(cfg: Config) {
  const server = await createServer(cfg);

  // Start server
  const instance = server.listen(cfg.port, cfg.hostname, () => {
    logger.info('Server start', { host: cfg.hostname, port: _.toString(cfg.port) });
  });

  process.on('SIGINT', () => {
    logger.info('Server shutting down');
    instance.close(() => {
      process.exit();
    });
  });
}

startServer(config);
