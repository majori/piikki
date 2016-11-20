let cfg = {};

cfg.env = process.env.NODE_ENV || 'development';
cfg.isProduction = cfg.env === 'production';

// Database configs
let dbLocalConnection = {
    host: process.env.PIIKKI_DATABASE_HOSTNAME || 'localhost',
	user: 'piikki',
	port: process.env.PIIKKI_DATABASE_PORT || 5433,
	password: process.env.PIIKKI_DATABASE_PASSWORD || 'piikki',
	database: 'piikkiDB',
	charset: 'utf8'
};

let dbConnection = process.env.PIIKKI_DATABASE_URL || dbLocalConnection;

cfg.db = {
    client: 'postgresql',
    connection: dbConnection,
	pool: { min: 0, max: 5 },
    migrations: {
        tableName: 'knex_migrations'
    }
};

module.exports = cfg;