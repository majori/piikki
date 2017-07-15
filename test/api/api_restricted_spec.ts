/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should, request } from 'chai';
import * as _ from 'lodash';
import { Express } from 'express';

import { Config } from '../../src/models/config';
import * as seed from '../../seeds/data/test';
import * as helper from '../helpers';

const cfg: Config = require('../../config'); // tslint:disable-line

const USER = _.clone(helper.user);
const GROUP = _.clone(helper.group);

const API = new helper.Api(cfg, 'restricted');

describe('Restricted API', () => {

  before(async () => {
    await helper.clearDbAndRunSeed();
    await API.start();
  });

  it('create new user [POST /users/create]', async () => {
    const res = await API
      .post(
        '/users/create',
        { username: 'otherUser', password: 'hackme' },
      );

    helper.expectOk(res);
  });

  it('authenticate user [POST /users/authenticate]', async () => {

    // With right password
    const res1 = await API
      .post(
        '/users/authenticate',
        USER,
      );

    helper.expectOk(res1);
    expect(res1.body.result.authenticated).to.be.true;

    // With wrong password
    const res2 = await API
      .post(
        '/users/authenticate',
        { username: USER.username, password: 'wrong_password' },
      );

    helper.expectOk(res2);
    expect(res2.body.result.authenticated).to.be.false;

    // With wrong username
    const res3 = await API
      .post(
        '/users/authenticate',
        { username: 'wrong_username', password: USER.password },
      );

    helper.expectOk(res3);
    expect(res3.body.result.authenticated).to.be.false;
  });

  it('create alternative login [POST /group/members/:username/authenticate/create]', async () => {
    const key = 'some_kind_of_id';

    const res = await API
      .post(
        '/users/authenticate/alternative/create',
        { key, username: USER.username },
      );

    helper.expectOk(res);
    expect(res.body.result.key).to.equal(key);
  });

  it('authenticate with alternative login [POST group/members/:username/authenticate]', async () => {
    const right_key = 'some_kind_of_id';

    // Right username with right key
    const res1 = await API
      .post(
        '/users/authenticate/alternative',
        { key: right_key },
      );
    helper.expectOk(res1);
    expect(res1.body.result.authenticated).to.be.true;

    // Right username with wrong key
    const res2 = await API
      .post(
        '/users/authenticate/alternative',
        { key: 'wrong_key' },
      );

    helper.expectOk(res2);
    expect(res2.body.result.authenticated).to.be.false;

    // Wrong username with right type
    const res3 = await API
      .post(
        '/users/authenticate/alternative',
        { key: right_key, type: 10 },
      );

    helper.expectOk(res3);
    expect(res3.body.result.authenticated).to.be.false;
  });

  it('reset password');
  it('reset username');
  it('get group members');
  it('get group member');
  it('add member to group');
  it('remove member from group');
  it('make transaction');
  it('get group transactions');
  it('get user transactions from group');
  it('get group saldo');
});

