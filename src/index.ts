import { createApp } from './app';
import * as Debug from 'debug';
import * as appInsights from 'applicationinsights';

const cfg: any = require('../config'); // tslint:disable-line
const debug = Debug('piikki:express');

const insights = appInsights
    .setup(cfg.appInsightsKey)
    .setAutoCollectRequests(false)
    .setAutoCollectPerformance(false)
    .setAutoCollectExceptions(false)
    .setAutoCollectConsole(false);

if (cfg.appInsightsKey) {
    insights.start();
}

const app = createApp(cfg);

// Start server
app.listen(cfg.port, cfg.hostname, () => {
    appInsights.client.trackEvent('Server start', { host: cfg.hostname, port: cfg.port });
    debug(`Server listening on http://${cfg.hostname}:${cfg.port}`);
});
