let cfg = {};

// ## Environment configs
//
cfg.env = process.env.NODE_ENV || 'development';
cfg.isProduction = cfg.env === 'production';

// ### HTTP-server configs
//
cfg.hostname = process.env.PIIKKI_HOSTNAME || 'localhost';
cfg.port = process.env.PIIKKI_PORT || 3000;

// ### Database configs
//
let dbLocalConnection = {
    host: process.env.PIIKKI_DATABASE_HOSTNAME || 'localhost',
	user: 'piikki',
	port: process.env.PIIKKI_DATABASE_PORT || 5433,
	password: process.env.PIIKKI_DATABASE_PASSWORD || 'piikki',
	database: 'piikkiDB',
	charset: 'utf8'
};

cfg.db = {
    client: 'postgresql',
    connection: process.env.PIIKKI_DATABASE_URL || dbLocalConnection,
	pool: { min: 0, max: 5 },
    migrations: {
        tableName: 'knex_migrations'
    }
};

module.exports = cfg;