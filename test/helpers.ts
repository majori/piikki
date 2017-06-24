import * as path from 'path';
import * as _ from 'lodash';

import { knex } from '../src/database';
import { IConfig } from '../src/models/config';
import * as tokenCore from '../src/core/token-core';
import * as groupCore from '../src/core/group-core';
import * as userCore from '../src/core/user-core';

const cfg: IConfig = require('../config');

export const tables = [
  'alternative_login',
  'transactions',
  'user_saldos',
  'token_group_access',
  'users',
  'groups',
  'tokens',
  'knex_migrations'
];

export const user = { username: 'user0', password: '1234', saldo: 0 };
export const group = { name: 'testGroup' };
export const globalToken = 'global_token';
export const restrictedToken = 'restricted_token';

export const routes = [
    { route: '/users', method: 'get' },
    { route: `/users/${user.username}`, method: 'get' },
    { route: '/users/create', method: 'post' },
    { route: '/users/authenticate', method: 'post' },
    { route: '/users', method: 'del' },
    { route: '/transaction', method: 'post' },
    { route: '/groups', method: 'post' }
];

export async function migrateAllDown(): Promise<void> {
  const version = await knex.migrate.currentVersion();
  if (version !== 'none') {
    await knex.migrate.rollback();
    return migrateAllDown();
  }
}

export async function migrateLatest() {
  return knex.migrate.latest({directory: cfg.dir.migrations});
}

export const runSeed = async () => knex.seed.run({
  directory: path.join(cfg.dir.seeds, 'test'),
});

export const clearDbAndRunSeed = async () => {
  await migrateAllDown();
  await migrateLatest();
  await runSeed();
};
