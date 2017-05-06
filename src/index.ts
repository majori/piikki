import { createApp } from './app';
import * as Debug from 'debug';
import * as appInsights from 'applicationinsights';

const cfg: any = require('../config'); // tslint:disable-line
const debug = Debug('piikki:express');

async function startServer() {
  const app = await createApp(cfg);

  // Start server
  app.listen(cfg.port, cfg.hostname, () => {
    appInsights.client.trackEvent('Server start', { host: cfg.hostname, port: cfg.port });
    debug(`Server listening on http://${cfg.hostname}:${cfg.port}`);
  });
}

startServer();
