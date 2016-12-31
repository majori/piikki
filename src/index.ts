import { createApp } from './app';
import * as Debug from 'debug';

const cfg = require('../config');
const debug = Debug('piikki:express');

const app = createApp(cfg);

app.listen(cfg.port, cfg.hostname, () => {
    debug(`Server listening on http://${cfg.hostname}:${cfg.port}`);
});
