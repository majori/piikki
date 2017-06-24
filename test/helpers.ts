import * as path from 'path';
import * as _ from 'lodash';

import { knex } from '../src/database';
import { IConfig } from '../src/models/config';

import * as seed from '../seeds/data/test';

const cfg: IConfig = require('../config');

export const user = _.clone(seed.users[0]);
export const group = _.clone(seed.groups[0]);
export const globalToken = 'global_token';
export const restrictedToken = 'restricted_token';

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

export const clearDb = async () => {
  await migrateAllDown();
  await migrateLatest();
};

export const clearDbAndRunSeed = async () => {
  await clearDb();
  await runSeed();
};
