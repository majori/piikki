import * as appInsights from 'applicationinsights';
import * as _ from 'lodash';
import { createApp } from './app';
import { IConfig } from './models/config';

const config: IConfig = require('../config'); // tslint:disable-line

async function startServer(cfg: IConfig) {
  const app = await createApp(cfg);

  // Start server
  app.listen(cfg.port, cfg.hostname, () => {
    appInsights.client.trackEvent('Server start', { host: cfg.hostname, port: _.toString(cfg.port) });
  });
}

startServer(config);
