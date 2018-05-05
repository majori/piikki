const _ = require('lodash');
const path = require('path');

let cfg = {};

cfg.dir = {
  source: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'build'),
  migrations: path.join(__dirname, 'migrations'),
  seeds: path.join(__dirname, 'seeds'),
  documents: path.join(__dirname, 'docs'),
};

// ## Environment configs
//
cfg.env = process.env.NODE_ENV || 'development';
cfg.isProduction = cfg.env === 'production';
cfg.isTest = cfg.env === 'test';

// ### HTTP-server configs
//
cfg.hostname = process.env.PIIKKI_HTTP_HOSTNAME || 'localhost';
cfg.port = process.env.PIIKKI_HTTP_PORT || process.env.port || 4000;

cfg.cors = {};

// ### Database configs
//
let dbConnection = {
  host: process.env.PIIKKI_DATABASE_HOSTNAME,
	user: process.env.PIIKKI_DATABASE_USER,
	password: process.env.PIIKKI_DATABASE_PASSWORD,
  database: process.env.PIIKKI_DATABASE_NAME,
  port: process.env.PIIKKI_DATABASE_PORT ? parseInt(process.env.PIIKKI_DATABASE_PORT) : 5432,
};

cfg.db = {
    client: process.env.PIIKKI_DATABASE_CLIENT || 'pg',
    connection: dbConnection,
    migrations: {
      disableTransactions: true,
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds/development'
    }
};

// ### Logger options
//
cfg.logLevel = process.env.LOG_LEVEL || 'info';


// ### Swagger documentation
//
cfg.swagger = {
  swaggerDefinition: {
    info: {
      title: 'Piikki',
      version: require('./package.json').version,
      description: 'API definition for Piikki API',
    },
    basePath: '/api/v1/',
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    security: [{ api_key: [] }],
    securityDefinitions: {
      token: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
      }
    }
  },
  apis: ['./src/router.ts'],
};

module.exports = cfg;
