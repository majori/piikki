const _ = require('lodash');
const path = require('path');

let cfg = {};

cfg.dir = {
  source: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'build'),
  migrations: path.join(__dirname, 'migrations'),
  seeds: path.join(__dirname, 'seeds'),
  library: path.join(__dirname, 'lib'),
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
  server: process.env.PIIKKI_DATABASE_HOSTNAME,
	user: process.env.PIIKKI_DATABASE_USER,
	password: process.env.PIIKKI_DATABASE_PASSWORD,
  options: {
    port: process.env.PIIKKI_DATABASE_PORT || 1433,
    database: process.env.PIIKKI_DATABASE_NAME,
    encrypt: true,
  }
};

cfg.db = {
    client: process.env.PIIKKI_DATABASE_CLIENT || 'mssql',
    connection: dbConnection,
    migrations: {
      disableTransactions: true,
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds/development'
    }
};

module.exports = cfg;
