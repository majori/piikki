import * as express from 'express';
import * as bodyParser from 'body-parser';
import routes from './routes';

const app = express();

const ENV = process.env.NODE_ENV || 'development';
const HOSTNAME = process.env.PIIKKI_HOSTNAME || 'localhost';
const PORT = process.env.PIIKKI_PORT || 3000;

if (ENV === 'development') {
    // Use dev middlewares
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Config routes
routes(app);

app.listen(PORT, HOSTNAME, () => {
    console.log(`Server listening on http://${HOSTNAME}:${PORT}`);
});
