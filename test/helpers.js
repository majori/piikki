const cfg = require('../config');
const path = require('path');
const Promise = require('bluebird');
const knex = require(path.join(cfg.buildDir, 'database')).knex;

const tokenCore = require(path.join(cfg.buildDir, 'core/token-core'));
const groupCore = require(path.join(cfg.buildDir, 'core/group-core'));
const userCore = require(path.join(cfg.buildDir, 'core/user-core'));

let helper = {};

helper.tables = ['transactions', 'user_saldos', 'token_group_access', 'users', 'groups', 'tokens', 'knex_migrations'];
helper.user = { username: 'testuser', password: '1234', saldo: 0 };
helper.group = { name: 'testGroup' };

helper.routes = [
    { route: '/users', method: 'get' },
    { route: `/users/${helper.user.username}`, method: 'get' },
    { route: '/users/create', method: 'post' },
    { route: '/users/authenticate', method: 'post' },
    { route: '/users', method: 'del' },
    { route: '/transaction', method: 'post' },
    { route: '/groups', method: 'post' }
];

// Clear tables and migrate to latest
helper.clearDb = () => Promise
    .each(helper.tables, table => knex.schema.dropTableIfExists(table))
    .then(() => knex.migrate.latest({directory: cfg.migrationDir}));

// Create user, group and token
helper.initializeUserAndGroup = () => groupCore.createGroup(helper.group.name)
    .then(() => userCore.createUser(helper.user))
    .then(() => groupCore.addUserToGroup(helper.user.username, helper.group.name));

helper.createRestrictedToken = () => tokenCore.createRestrictedToken(helper.group.name);
helper.createGlobalToken = () => tokenCore.createGlobalToken();

module.exports = helper;
