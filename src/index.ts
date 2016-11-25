import * as bodyParser from 'body-parser';
import * as debug from 'debug';
import * as errorHandler from 'errorhandler';
import * as express from 'express';
import * as methodOverride from 'method-override';
import * as database from './database';

import handlers from './handlers';
import routes from './routes';

const cfg = require('../config');
const log = debug('http');

const app = express();

// Use dev middlewares
if (!cfg.isProduction) {
    app.use(errorHandler());
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

// Configure routes
routes(app);

// Configure error handlers
handlers(app);

app.listen(cfg.port, cfg.hostname, () => {
    log(`Server listening on http://${cfg.hostname}:${cfg.port}`);
});
