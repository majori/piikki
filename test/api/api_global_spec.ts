/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect } from 'chai';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as BBPromise from 'bluebird';

import cfg from '../../src/config';
import * as seed from '../../seeds/data/test';
import * as helper from '../helpers';
import * as transactionCore from '../../src/core/transaction-core';

const USER = _.clone(helper.user);
const GROUP = _.clone(helper.group);

const API = new helper.Api(cfg, 'global');

describe('Global API', () => {

  before(async () => {
    await helper.clearDbAndRunSeed();
    await API.start();
  });
  beforeEach(helper.clearDbAndRunSeed);

  it('get users', async () => {
    const res = await API.get('/users');

    helper.expectOk(res);
    expect(res.body.result).have.length(seed.data.users.length);
  });

  it('get user', async () => {
    const res = await API.get(`/users/${USER.username}`);

    helper.expectOk(res);
    expect(res.body.result).to.have.property('username', USER.username);
    expect(res.body.result).to.have.property('saldos');
  });

  it('create a new user', async () => {
    const username = 'someUser';
    const res1 = await API.post(
      '/users/create',
      { username, password: 'hackme' },
    );
    helper.expectOk(res1);

    const res2 = await API.get(`/users/${username}`);

    helper.expectOk(res2);
    expect(res2.body.result.saldos).to.be.empty;
    expect(res2.body.result.defaultGroup).to.be.null;

    // Username can not be a number
    helper.expectError(
      await API.post('/users/create', { username: '12345', password: 'hackme' }),
      400,
    );
  });

  it('delete user', async () => {
    const res1 = await API.del(
      '/users',
      { username: USER.username},
    );

    helper.expectOk(res1);

    // Check that user can not be found anymore
    helper.expectError(
      await API.get(`/users/${USER.username}`),
      404,
    );

    // The user is cannot be found in the group
    const res2 = await API.get(`/groups/${GROUP.groupName}/members`);
    expect(_(res2.body.result).map('username').includes(USER.username)).to.be.false;

    // Try delete user which does not exist
    helper.expectError(
      await API.del('/users', { username: 'unknown_user' }),
      404,
    );
  });

  it('authenticate user', async () => {
    const res = await API.post(
      '/users/authenticate',
      USER,
    );

    helper.expectOk(res);
    expect(res.body.result.authenticated).to.be.true;

  });

  it('create alternative login for user', async () => {
    const ALTERNATIVE_KEY = 'some_kind_of_id';

    const res = await API.post(
      '/users/authenticate/alternative/create',
      { key: ALTERNATIVE_KEY, groupName: GROUP.groupName, username: USER.username },
    );

    helper.expectOk(res);
    expect(res.body.result.key).to.equal(ALTERNATIVE_KEY);
  });

  it('authenticate with alternative login', async () => {
    const ALTERNATIVE_KEY = 'some_kind_of_id';

    await API.post(
      '/users/authenticate/alternative/create',
      { key: ALTERNATIVE_KEY, groupName: GROUP.groupName, username: USER.username },
    );

    // Right username with right key
    const res1 = await API.post(
      '/users/authenticate/alternative',
      { key: ALTERNATIVE_KEY, groupName: GROUP.groupName },
    );

    helper.expectOk(res1);
    expect(res1.body.result.authenticated).to.be.true;

    // Right username with wrong key
    const res2 = await API.post(
      '/users/authenticate/alternative',
      { key: 'wrong_key', groupName: GROUP.groupName },
    );

    helper.expectOk(res2);
    expect(res2.body.result.authenticated).to.be.false;

    // Wrong username with right key
    const res3 = await API.post(
      '/users/authenticate/alternative',
      { type: 2, key: ALTERNATIVE_KEY, groupName: GROUP.groupName },
    );

    helper.expectOk(res3);
    expect(res3.body.result.authenticated).to.be.false;
  });

  it('get alternative login count for user', async () => {
    const ALTERNATIVE_KEY = 'some_kind_of_id';

    const res1 = await API.get('/users/authenticate/alternative/count', {
      username: USER.username,
      groupName: GROUP.groupName,
    });

    helper.expectOk(res1);
    expect(res1.body.result.count).to.equal(1);

    await API.post(
      '/users/authenticate/alternative/create',
      { key: ALTERNATIVE_KEY, groupName: GROUP.groupName, username: USER.username },
    );

    const res2 = await API.get('/users/authenticate/alternative/count', {
      username: USER.username,
      groupName: GROUP.groupName,
    });

    helper.expectOk(res2);
    expect(res2.body.result.count).to.equal(2);
  });

  it('set user\'s default group', async () => {
    const res = await API.post(`/users/${USER.username}/defaultGroup`, {
      groupName: GROUP.groupName,
    });
    helper.expectOk(res);
  });

  it('reset password', async () => {
    const newPassword = 'new_password';

    helper.expectOk(await API.put('/users/reset/password', {
      username: USER.username,
      oldPassword: USER.password,
      newPassword,
    }));

    helper.expectError(
      await API.get('/users/authenticate', {
        username: USER.username,
        password: USER.password,
      }),
      404,
    );

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

    helper.expectOk(await API.get(`/groups/${GROUP.groupName}/members/${newUsername}`));

    helper.expectError(
      await API.get(`/groups/${GROUP.groupName}/members/${USER.username}`),
      404,
    );

    // Reset username back to original
    await API.put('/users/reset/username', {
      oldUsername: newUsername,
      newUsername: USER.username,
      password: USER.password,
    });
  });

  it('get groups', async () => {
    const res1 = await API.get('/groups');
    helper.expectOk(res1);
    expect(res1.body.result).to.have.length(seed.meta.groups.public);

    const res2 = await API.get('/groups', { all: true });
    helper.expectOk(res2);
    expect(res2.body.result).to.have.length(seed.meta.groups.all);
    res2.body.result.forEach((group) => {
      expect(group).to.have.property('id');
      expect(group).to.have.property('name');
      expect(group).to.have.property('private');
    });
  });

  it('get group', async () => {
    const res1 = await API.get(`/groups/${GROUP.groupName}`);
    helper.expectOk(res1);
    expect(res1.body.result).to.have.property('id');
    expect(res1.body.result).to.have.property('name', GROUP.groupName);
    expect(res1.body.result).to.have.property('private');
    expect(res1.body.result).to.have.property('members');
    expect(res1.body.result.members).to.have.length(seed.meta.membersInGroup.group1);
    for (const member of res1.body.result.members) {
      expect(member).to.property('username');
      expect(member).to.property('saldo');
    }

    // Try fetch group with ID
    const res2 = await API.get('/groups/1');
    helper.expectOk(res2);

    helper.expectError(
      await API.get('/groups/-1'),
      400,
    );

    helper.expectError(
      await API.get('/groups/NOT_FOUND'),
      404,
    );
  });

  it('get group members', async () => {
    const res = await API.get(`/groups/${GROUP.groupName}/members`);
    helper.expectOk(res);
    expect(res.body.result).to.have.length(seed.meta.membersInGroup[GROUP.groupName]);
  });

  it('get group member', async () => {
    const res = await API.get(`/groups/${GROUP.groupName}/members/${USER.username}`);
    helper.expectOk(res);
    expect(res.body.result).to.have.property('username', USER.username);
    expect(res.body.result).to.have.property('saldo');
  });

  it('create a group', async () => {
    const newGroup = 'new_group';

    // Create new group
    const res1 = await API.post(
      '/groups/create',
      { groupName: newGroup },
    );

    helper.expectOk(res1);
    expect(res1.body.result).to.have.property('id', seed.data.groups.length);
    expect(res1.body.result).to.have.property('groupName', newGroup);
    expect(res1.body.result).to.have.property('token');
    expect(res1.body.result).to.not.have.property('password');

    // Check the group exists
    const res2 = await API.get('/groups');

    helper.expectOk(res2);
    expect(res2.body.result).to.have.length(seed.meta.groups.public + 1);

    // Group name can not be a number
    helper.expectError(
      await API.post('/groups/create', { groupName: '12345'}),
      400,
    );
  });

  it('create a private group', async () => {
    const privateGroup = 'private_group';

    // Create new private group
    const res1 = await API.post(
      '/groups/create',
      { groupName: privateGroup, private: true },
    );

    helper.expectOk(res1);
    expect(res1.body.result).to.have.property('id', seed.data.groups.length);
    expect(res1.body.result).to.have.property('groupName', privateGroup);
    expect(res1.body.result).to.have.property('token');
    expect(res1.body.result).to.have.property('password');

    // Check that the group doesn't show up in groups
    const res2 = await API.get('/groups');
    helper.expectOk(res2);
    expect(res2.body.result).to.have.length(seed.meta.groups.public);
  });

  it('add member to group', async () => {
    const res1 = await API.get(`/groups/${GROUP.groupName}/members`);
    helper.expectOk(res1);
    const memberCount = _.size(res1.body.result);

    const res2 = await API.post(`/groups/${GROUP.groupName}/addMember`, {
      username: seed.data.users[3].username,
    });
    helper.expectOk(res2);

    const res3 = await API.get(`/groups/${GROUP.groupName}/members`);
    helper.expectOk(res3);
    expect(res3.body.result).to.have.length(memberCount + 1);
  });

  it('add member to private group', async () => {
    const group = helper.privateGroup.groupName;
    const password = helper.privateGroup.password;

    const res1 = await API.post(
      `/groups/${group}/addMember`,
      { username: USER.username, password },
    );
    helper.expectOk(res1);

    helper.expectError(
      await API.post(
        `/groups/${group}/addMember`,
        { username: seed.data.users[1].username, password: 'wrong' },
      ),
      400,
    );

  });

  it('remove member from group', async () => {
      await API.post(`/groups/${GROUP.groupName}/addMember`, {
        username: seed.data.users[3].username,
      });

      const res1 = await API.get(`/groups/${GROUP.groupName}/members`);
      helper.expectOk(res1);
      const memberCount = _.size(res1.body.result);

      const res2 = await API.del(`/groups/${GROUP.groupName}/removeMember`, {
        username: seed.data.users[3].username,
      });
      helper.expectOk(res2);

      const res3 = await API.get(`/groups/${GROUP.groupName}/members`);
      helper.expectOk(res3);
      expect(res3.body.result).to.have.length(memberCount - 1);
  });

  it('make a transaction', async () => {
    const amount = 1;
    const res = await API.post('/transaction', {
      username: USER.username,
      groupName: GROUP.groupName,
      amount,
    });

    helper.expectOk(res);
    expect(res.body.result.saldo).to.equal(seed.meta.saldos[USER.username][GROUP.groupName] + amount);
  });

  it('get group transactions', async () => {
    const res = await API.get(`/transactions/group/${GROUP.groupName}`, {
      from: moment().subtract(1, 'day').format(),
    });

    helper.expectOk(res);
    expect(res.body.result).to.have.length(2);
  });

  it('get user transactions', async () => {
    const res = await API.get(`/transactions/user/${USER.username}`, {
      from: moment().subtract(1, 'day').format(),
    });

    helper.expectOk(res);
    expect(res.body.result).to.have.length(1);
  });

  it('get group saldo', async () => {
    const res = await API.get(`/groups/${GROUP.groupName}/saldo`);

    helper.expectOk(res);
    expect(res.body.result.saldo).to.equal(0);
  });

  it('get daily group saldo since', async () => {
    const res1 = await API.get(`/groups/${GROUP.groupName}/saldo/daily`, {
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

    const res3 = await API.get(`/groups/${GROUP.groupName}/saldo/daily`, {
      from: moment().subtract(1, 'day').format(),
    });

    helper.expectOk(res3);
    expect(res3.body.result).to.have.length(2);
    expect(res3.body.result[0].saldo).to.equal(0);
    expect(res3.body.result[1].saldo).to.equal(1); // Newest last
  });
});
