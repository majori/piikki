/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should, request } from 'chai';
import * as _ from 'lodash';
import { Express } from 'express';

import { Config } from '../src/models/config';
import * as seed from '../seeds/data/test';
import * as helper from './helpers';
import { expectOk } from './helpers';

const cfg: Config = require('../config'); // tslint:disable-line

const USER = _.clone(helper.user);
const GROUP = _.clone(helper.group);

const API = new helper.Api(cfg, 'admin');

describe('Admin API', () => {

  before(async () => {
    await helper.clearDbAndRunSeed();
    await API.start();
  });

  it('create a restricted token', async () => {
    const res = await API.post(
      '/tokens/restricted',
      { groupName: GROUP.groupName, comment: 'Test token'},
    );

    expectOk(res);
    expect(res.body.result).to.be.string;
  });

  it('create a global token', async () => {
    const res = await API.post(
      '/tokens/global',
      { comment: 'Test token' },
    );

    expectOk(res);
    expect(res.body.result).to.be.string;
  });

  it('create a admin token', async () => {
    const res = await API.post(
      '/tokens/admin',
      { comment: 'Test token' },
    );

    expectOk(res);
    expect(res.body.result).to.be.string;
  });

  it('get tokens', async () => {
    const res = await API.get('/tokens');

    expectOk(res);
    expect(res.body.result).to.have.length(seed.data.tokens.length + 3);
  });

  it('delete token', async () => {

    // Get one token
    const res1 = await API.get('/tokens');
    expectOk(res1);

    const lastToken: any = _.last(res1.body.result);

    // Delete the token
    const res2 = await API.del(
      '/tokens',
      { token: lastToken.token },
    );

    expectOk(res2);

    // Check that the token does not exist anymore
    const res3 = await API.get('/tokens');

    expectOk(res3);
    expect(res3.body.result).to.have.length(res1.body.result.length - 1);
  });

  it('force reset password', async () => {
    const newPassword = 'something_completely_new';
    const API_RESTRICTED = new helper.Api(cfg, 'restricted');

    await API_RESTRICTED.start();

    // Test with old password
    const res1 = await API_RESTRICTED.post(
      '/users/authenticate',
      { username: USER.username, password: USER.password },
    );

    expectOk(res1);
    expect(res1.body.result.authenticated).to.be.true;

    // Do the force-reset
    const res2 = await API.put(
      '/users/force-reset/password',
      { username: USER.username, newPassword },
    );

    expectOk(res2);

    // Try to authenticate with the new password
    const res3 = await API_RESTRICTED.post(
      '/users/authenticate',
      { username: USER.username, password: newPassword },
    );

    expectOk(res3);
    expect(res3.body.result.authenticated).to.be.true;
  });
});
