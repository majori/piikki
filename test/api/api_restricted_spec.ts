/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should, request } from 'chai';
import * as _ from 'lodash';
import { Express } from 'express';

import { Config } from '../../src/types/config';
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

  it('create new user', async () => {
    const res = await API
      .post(
        '/users/create',
        { username: 'otherUser', password: 'hackme' },
      );

    helper.expectOk(res);
  });

  it('authenticate user', async () => {

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

  it('create alternative login', async () => {
    const key = 'some_kind_of_id';

    const res = await API
      .post(
        '/users/authenticate/alternative/create',
        { key, username: USER.username },
      );

    helper.expectOk(res);
    expect(res.body.result.key).to.equal(key);
  });

  it('authenticate with alternative login', async () => {
    const rightKey = 'some_kind_of_id';

    // Right username with right key
    const res1 = await API
      .post(
        '/users/authenticate/alternative',
        { key: rightKey },
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
        { key: rightKey, type: 10 },
      );

    helper.expectOk(res3);
    expect(res3.body.result.authenticated).to.be.false;
  });

  it('get alternative login count for user', async () => {
    const res = await API.get('/users/authenticate/alternative/count', {
      username: USER.username,
      groupName: GROUP.groupName,
    });

    helper.expectOk(res);
    expect(res.body.result.count).to.equal(1);
  });

  it('reset password', async () => {
    const newPassword = 'new_password';

    helper.expectOk(await API.put('/users/reset/password', {
      username: USER.username,
      oldPassword: USER.password,
      newPassword,
    }));

    expect(API.get('/users/authenticate', {
      username: USER.username,
      password: USER.password,
    })).to.eventually.be.rejected;

    helper.expectOk(await API.post('/users/authenticate', {
      username: USER.username,
      password: newPassword,
    }));

    // Reset password back to original
    await API.put('/users/reset/password', {
      username: USER.username,
      oldPassword: newPassword,
      newPassword: USER.password,
    });
  });

  it('reset username', async () => {
    const newUsername = 'new_username';

    helper.expectOk(await API.put('/users/reset/username', {
      oldUsername: USER.username,
      newUsername,
      password: USER.password,
    }));

    helper.expectOk(await API.get(`/group/members/${newUsername}`));
    expect(API.get(`/group/members/${USER.username}`)).to.eventually.be.rejected;

    // Reset username back to original
    await API.put('/users/reset/username', {
      oldUsername: newUsername,
      newUsername: USER.username,
      password: USER.password,
    });
  });

  it('get group members', async () => {
    const res = await API.get('/group/members');
    helper.expectOk(res);
    expect(res.body.result).to.have.length(seed.meta.membersInGroup[GROUP.groupName]);
  });

  it('get group member', async () => {
    const res = await API.get(`/group/members/${USER.username}`);
    helper.expectOk(res);
    expect(res.body.result).to.have.property('username', USER.username);
    expect(res.body.result).to.have.property('saldo');
  });

  it('add member to group', async () => {
    const res1 = await API.get('/group/members');
    helper.expectOk(res1);
    const memberCount = _.size(res1.body.result);

    const res2 = await API.post('/group/addMember', {
      username: seed.data.users[3].username,
    });
    helper.expectOk(res2);

    const res3 = await API.get('/group/members');
    helper.expectOk(res3);
    expect(res3.body.result).to.have.length(memberCount + 1);
  });

  it('remove member from group', async () => {
      const res1 = await API.get('/group/members');
      helper.expectOk(res1);
      const memberCount = _.size(res1.body.result);

      const res2 = await API.del('/group/removeMember', {
        username: seed.data.users[3].username,
      });
      helper.expectOk(res2);

      const res3 = await API.get('/group/members');
      helper.expectOk(res3);
      expect(res3.body.result).to.have.length(memberCount - 1);
  });
  it('make transaction', async () => {
    const res = await API.post('/transaction', {
      username: USER.username,
      amount: 1,
    });

    helper.expectOk(res);
    expect(res.body.result.saldo).to.equal(seed.meta.saldos[USER.username][GROUP.groupName] + 1);
  });

  it('get group transactions');
  it('get user transactions from group');
  it('get group saldo');
  it('get daily group saldo since');
});
