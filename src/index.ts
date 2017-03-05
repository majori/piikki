import { createApp } from './app';
import * as Debug from 'debug';
import appInsights = require('applicationinsights');

import cfg = require('../config');
const debug = Debug('piikki:express');

appInsights.setup(cfg.appInsightsKey)
    .setAutoCollectRequests(false)
    .start();

const app = createApp(cfg);

// Start server
app.listen(cfg.port, cfg.hostname, () => {
    appInsights.client.trackEvent('Server start', { host: cfg.hostname, port: cfg.port });
    debug(`Server listening on http://${cfg.hostname}:${cfg.port}`);
});
