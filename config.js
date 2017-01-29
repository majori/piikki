const _ = require('lodash');

let cfg = {};

cfg.buildDir = `${__dirname}/dist`;
cfg.sourceDir = `${__dirname}/src`;
cfg.migrationDir = `${__dirname}/migrations`;

// ## Environment configs
//
cfg.env = process.env.NODE_ENV || 'development';
cfg.isProduction = cfg.env === 'production';
cfg.isTest = cfg.env === 'test';

// ### HTTP-server configs
//
cfg.hostname = process.env.PIIKKI_HTTP_HOSTNAME || 'localhost';
cfg.port = process.env.PIIKKI_HTTP_PORT || 4000;

// ### Database configs
//
let dbLocalConnection = {
    host: process.env.PIIKKI_DATABASE_HOSTNAME || 'localhost',
	port: process.env.PIIKKI_DATABASE_PORT || 5432,
	user: process.env.PIIKKI_DATABASE_USER || 'piikki',
	password: process.env.PIIKKI_DATABASE_PASSWORD || 'piikki',
	database: process.env.PIIKKI_DATABASE_NAME || 'piikkiDB',
	charset: 'utf8'
};

// Use different database for testing
if (cfg.isTest) { _.assign(dbLocalConnection, { database: 'piikkiDB_test' }); };

cfg.db = {
    client: 'postgresql',
    connection: process.env.PIIKKI_DATABASE_URL || dbLocalConnection,
	pool: { min: 0, max: 5 },
    migrations: {
        tableName: 'knex_migrations'
    }
};

// ### Token configs
//
cfg.tokenFilePath = path.join(cfg.buildDir, 'tokens.json');

module.exports = cfg;