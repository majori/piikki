import * as express from 'express';
import * as bodyParser from 'body-parser';
import routes from './routes';
import database from './database';
const cfg = require('../config');

const app = express();

if (!cfg.isProduction) {
    // Use dev middlewares
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Config routes
routes(app);

app.listen(cfg.port, cfg.hostname, () => {
    console.log(`Server listening on http://${cfg.hostname}:${cfg.port}`);
});
