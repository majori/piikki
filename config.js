const _ = require('lodash');
const path = require('path');

let cfg = {};

cfg.buildDir = `${__dirname}/dist`;
cfg.sourceDir = `${__dirname}/src`;
cfg.migrationDir = `${__dirname}/migrations`;

// ## Environment configs
//
cfg.env = process.env.NODE_ENV || 'development';
cfg.isProduction = cfg.env === 'production';
cfg.isTest = cfg.env === 'test';
cfg.appInsightsKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;

// ### HTTP-server configs
//
cfg.hostname = process.env.PIIKKI_HTTP_HOSTNAME || 'localhost';
cfg.port = process.env.PIIKKI_HTTP_PORT || process.env.port || 4000;

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

// Use different database for testing
if (!cfg.isProduction || cfg.isTest) { _.set(dbConnection, 'options.database', 'piikkiDBdev'); };

const dbClient = process.env.PIIKKI_DATABASE_CLIENT || 'mssql';

cfg.db = {
    client: dbClient,
    connection: dbConnection,
    migrations: {
        disableTransactions: true,
        tableName: 'knex_migrations'
    }
};

// ### Token configs
//
cfg.tokenFilePath = path.join(cfg.buildDir, 'tokens.json');

module.exports = cfg;