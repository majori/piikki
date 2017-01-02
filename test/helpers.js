const cfg = require('../config');
const path = require('path');
const Promise = require('bluebird');
const knex = require(path.join(cfg.buildDir, 'database')).knex;

const TABLES = ['transactions', 'user_saldos', 'token_group_access', 'users', 'groups', 'tokens', 'knex_migrations'];

let helper = {};

helper.user = { username: 'testuser', password: '1234', saldo: 0 };
helper.group = { name: 'testGroup' };

// Clear tables and migrate to latest
helper.clearDb = () => Promise
    .each(TABLES, table => knex.schema.dropTableIfExists(table))
    .then(() => knex.migrate.latest({directory: cfg.migrationDir}));

module.exports = helper;
