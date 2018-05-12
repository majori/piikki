/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect } from 'chai';
import * as _ from 'lodash';
import * as moment from 'moment';

import cfg from '../../config';
import * as seed from '../../seeds/data/test';
import * as helper from '../helpers';
import * as transactionCore from '../../src/core/transaction-core';

const USER = _.clone(helper.user);
const GROUP = _.clone(helper.group);

const API = new helper.Api(cfg, 'restricted');

describe('Restricted API', () => {

  before(async () => {
    await helper.clearDbAndRunSeed();
    await API.start();
  });
  beforeEach(helper.clearDbAndRunSeed);

  it('create a new user', async () => {
    const res = await API.post(
        '/users/create',
        { username: 'otherUser', password: 'hackme' },
      );

    helper.expectOk(res);

    // Username can not be a number
    helper.expectError(
      await API.post('/users/create', { username: '12345', password: 'hackme' }),
      400,
    );
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
    const ALTERNATIVE_KEY = 'some_kind_of_id';
    const res = await API
      .post(
        '/users/authenticate/alternative/create',
        { key: ALTERNATIVE_KEY, username: USER.username },
      );

    helper.expectOk(res);
    expect(res.body.result.key).to.equal(ALTERNATIVE_KEY);
  });

  it('authenticate with alternative login', async () => {
    const ALTERNATIVE_KEY = 'some_kind_of_id';
    await API.post(
      '/users/authenticate/alternative/create',
      { key: ALTERNATIVE_KEY, username: USER.username, type: 20 },
    );

    // Right username with right key
    const res1 = await API
      .post(
        '/users/authenticate/alternative',
        { key: ALTERNATIVE_KEY, type: 20 },
      );
    helper.expectOk(res1);
    expect(res1.body.result.authenticated).to.be.true;
    expect(res1.body.result.username).to.equal(USER.username);

    // Wrong key with right type
    const res2 = await API
      .post(
        '/users/authenticate/alternative',
        { key: 'wrong_key', type: 20 },
      );

    helper.expectOk(res2);
    expect(res2.body.result.authenticated).to.be.false;

    // Right key with wrong type
    const res3 = await API
      .post(
        '/users/authenticate/alternative',
        { key: ALTERNATIVE_KEY, type: 10 },
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

    // User can't be authenticated with the old password
    const res = await API.post('/users/authenticate', {
      password: USER.password,
      username: USER.username,
    });
    expect(res.body.result.authenticated).to.be.false;

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

    helper.expectError(
      await API.get(`/group/members/${USER.username}`),
      404,
    );

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
      const res1 = await API.post('/group/addMember', {
        username: seed.data.users[3].username,
      });
      helper.expectOk(res1);

      const res2 = await API.get('/group/members');
      helper.expectOk(res2);
      const memberCount = _.size(res2.body.result);

      const res3 = await API.del('/group/removeMember', {
        username: seed.data.users[3].username,
      });
      helper.expectOk(res3);

      const res4 = await API.get('/group/members');
      helper.expectOk(res4);
      expect(res4.body.result).to.have.length(memberCount - 1);
  });

  it('make a transaction', async () => {
    const amount = 1;
    const res = await API.post('/transaction', {
      username: USER.username,
      amount,
    });

    helper.expectOk(res);
    expect(res.body.result.saldo).to.equal(seed.meta.saldos[USER.username][GROUP.groupName] + amount);
  });

  it('get group transactions', async () => {
    const res = await API.get('/group/transactions', {
      from: moment().subtract(1, 'day').format(),
    });

    helper.expectOk(res);
    expect(res.body.result).to.have.length(2);
  });

  it('get user transactions from group', async () => {
    const res = await API.get(`/group/transactions/${USER.username}`, {
      from: moment().subtract(1, 'day').format(),
    });

    helper.expectOk(res);
    expect(res.body.result).to.have.length(1);
  });

  it('get group saldo', async () => {
    const res = await API.get('/group/saldo');

    helper.expectOk(res);
    expect(res.body.result.saldo).to.equal(0);
  });

  it('get daily group saldo since', async () => {
    const res1 = await API.get('/group/saldo/daily', {
      from: moment().format(),
    });

    helper.expectOk(res1);
    expect(res1.body.result[0].saldo).to.equal(0);
    expect(res1.body.result[0].timestamp).to.equal(moment().format('YYYY-MM-DD'));

    await transactionCore.makeTransaction({
      username: USER.username,
      groupName: GROUP.groupName,
      amount: 1,
      tokenId: 1,
      timestamp: moment().toISOString(),
    });

    const res3 = await API.get('/group/saldo/daily', {
      from: moment().subtract(1, 'day').format(),
    });

    helper.expectOk(res3);
    expect(res3.body.result).to.have.length(2);
    expect(res3.body.result[0].saldo).to.equal(0);
    expect(res3.body.result[1].saldo).to.equal(1);

  });
});
