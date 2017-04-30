import { createApp } from './app';
import * as Debug from 'debug';
import * as appInsights from 'applicationinsights';

const cfg: any = require('../config'); // tslint:disable-line
const debug = Debug('piikki:express');

if (cfg.appInsightsKey) {
    appInsights
        .setup(cfg.appInsightsKey)
        .setAutoCollectRequests(false)
        .setAutoCollectPerformance(false)
        .setAutoCollectExceptions(false)
        .setAutoCollectConsole(false)
        .start();
}

const app = createApp(cfg);

// Start server
app.listen(cfg.port, cfg.hostname, () => {
    if (cfg.appInsightsKey) {
        appInsights.client.trackEvent('Server start', { host: cfg.hostname, port: cfg.port });
    }
    debug(`Server listening on http://${cfg.hostname}:${cfg.port}`);
});
