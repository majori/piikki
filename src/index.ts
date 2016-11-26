import * as debug from 'debug';
import { createApp } from './app';

const cfg = require('../config');
const log = debug('piikki:http');

const app = createApp(cfg);

app.listen(cfg.port, cfg.hostname, () => {
    log(`Server listening on http://${cfg.hostname}:${cfg.port}`);
});
