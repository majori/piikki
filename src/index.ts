import * as process from 'process';
import * as _ from 'lodash';
import { createServer } from './server';
import { Logger } from './logger';
import config from './config';
import { IConfig } from './types/config';

const logger = new Logger(__filename);

async function startServer(cfg: IConfig) {
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
