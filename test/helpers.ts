/* tslint:disable:no-unused-expression */
import { expect, request } from 'chai';
import * as path from 'path';

import cfg from '../src/config';
import { IConfig } from '../src/types/config';
import { createServer } from '../src/server';
import { knex } from '../src/database';

import * as seed from '../seeds/data/test';

interface RequestOptions {
  method: 'get' | 'post' | 'put' | 'del';
  url: string;
  body?: any;
  query?: any;
}

export const user = seed.data.users[0];
export const group = seed.data.groups[0];
export const privateGroup = seed.data.groups[2];

export const tokens = {
  admin: 'admin_token',
  global: 'global_token',
  restricted: 'restricted_token',
};

export async function migrateAllDown(): Promise<void> {
  const version = await knex.migrate.currentVersion();
  if (version !== 'none') {
    await knex.migrate.rollback();
    return migrateAllDown();
  }
}

export const runSeed = async () => knex.seed.run({
  directory: path.join(cfg.dir.seeds, 'test'),
});

export const clearDb = async () => {
  await migrateAllDown();
  await knex.migrate.latest({directory: cfg.dir.migrations});
};

export const clearDbAndRunSeed = async () => {
  await clearDb();
  await runSeed();
};

export function expectOk(res: ChaiHttp.Response) {
  expect(res).to.be.json;
  expect(res).to.have.status(200);
  expect(res.body).to.have.property('ok', true);
  expect(res.body).to.have.property('result');
}

export function expectError(res: any, status?: number) {
  expect(res.error).not.to.be.null;
  expect(res.status).not.to.equal(200);
  expect(res.body).to.have.property('ok', false);
  expect(res.body).to.have.property('error');

  status && expect(res.status).to.equal(status);
}

export class Api {
  private config: IConfig;
  private role: 'admin' | 'global' | 'restricted';
  private api: any;

  constructor(config: IConfig, role: 'admin' | 'global' | 'restricted') {
    this.config = config;
    this.role = role;
  }

  public async start() {
    this.api = await createServer(this.config);
  }

  public get(url: string, query?: any) {
    return this.makeRequest({
      method: 'get',
      url,
      query,
    });
  }

  public post(url: string, body: any) {
    return this.makeRequest({
      method: 'post',
      url,
      body,
    });
  }

  public put(url: string, body: any) {
    return this.makeRequest({
      method: 'put',
      url,
      body,
    });
  }

  public del(url: string, body: any) {
    return this.makeRequest({
      method: 'del',
      url,
      body,
    });
  }

  private async makeRequest(options: RequestOptions) {
    const req: ChaiHttp.Request = request(this.api)[options.method](`/api/v1/${this.role}${options.url}`);

    req.set('Authorization', tokens[this.role]);
    options.query && req.query(options.query);
    options.body && req.send(options.body);

    try {
      return await req;
    } catch (err) {
      return {
        ...err.response,
        body: JSON.parse(err.response.text),
        error: true,
      };
    }
  }
}
