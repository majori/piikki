import { createApp } from './app';
import * as appInsights from 'applicationinsights';

const cfg: any = require('../config'); // tslint:disable-line

async function startServer() {
  const app = await createApp(cfg);

  // Start server
  app.listen(cfg.port, cfg.hostname, () => {
    appInsights.client.trackEvent('Server start', { host: cfg.hostname, port: cfg.port });
  });
}

startServer();
