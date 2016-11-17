import * as express from 'express';
import errorHandler from 'errorhandler';
import routes from './routes';

const app = express();

const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PIIKKI_PORT || 3000;

if (ENV === 'development') {
    app.use(errorHandler());
}

// Config routes
routes(app);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
