import * as appInsights from 'applicationinsights';
import * as _ from 'lodash';
import { createApp } from './app';
import { Config } from './models/config';

const config: Config = require('../config'); // tslint:disable-line

async function startServer(cfg: Config) {
  const app = await createApp(cfg);

  // Start server
  app.listen(cfg.port, cfg.hostname, () => {
    appInsights.client.trackEvent('Server start', { host: cfg.hostname, port: _.toString(cfg.port) });
  });
}

startServer(config);
