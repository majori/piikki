import { createApp } from './app';

const cfg = require('../config');

const app = createApp(cfg);

app.listen(cfg.port, cfg.hostname, () => {
    console.log(`Server listening on http://${cfg.hostname}:${cfg.port}`);
});
