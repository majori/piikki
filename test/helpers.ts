/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import * as path from 'path';
import * as _ from 'lodash';

import { knex } from '../src/database';
import { Config } from '../src/models/config';

import * as seed from '../seeds/data/test';

const cfg: Config = require('../config');

export const user = seed.data.users[0];
export const group = seed.data.groups[0];

export const adminToken = 'admin_token';
export const globalToken = 'global_token';
export const restrictedToken = 'restricted_token';

export async function clearTable(tableName: string) {
  return knex(tableName).del();
}

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

export function expectOk(err: any, res: ChaiHttp.Response) {
  expect(err).to.be.null;
  expect(res).to.be.json;
  expect(res).to.have.status(200);
  expect(res.body).to.have.property('ok', true);
  expect(res.body).to.have.property('result');
}

export function expectError(err: any, res: ChaiHttp.Response) {
  expect(err).not.to.be.null;
  expect(res).to.be.json;
  expect(res.body).to.have.property('ok', false);
  expect(res.body).to.have.property('error');
  expect(res.body.error).to.have.property('type');
  expect(res.body.error).to.have.property('message');
}
