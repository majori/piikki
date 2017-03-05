import { createApp } from './app';
import * as Debug from 'debug';
import appInsights = require('applicationinsights');

import cfg = require('../config');
const debug = Debug('piikki:express');

appInsights.setup(cfg.appInsightsKey)
    .setAutoCollectRequests(false)
    .start();

appInsights.client.commonProperties = {
    environment: cfg.env,
};

const app = createApp(cfg);

// Start server
app.listen(cfg.port, cfg.hostname, () => {
    debug(`Server listening on http://${cfg.hostname}:${cfg.port}`);
});
