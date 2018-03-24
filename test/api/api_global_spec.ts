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

const API = new helper.Api(cfg, 'global');

describe('Global API', () => {

  before(async () => {
    await helper.clearDbAndRunSeed();
    await API.start();
  });

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

  it('authenticate user', async () => {
    const res = await API.post(
      '/users/authenticate',
      USER,
    );

    helper.expectOk(res);
    expect(res.body.result.authenticated).to.be.true;

  });

  const ALTERNATIVE_KEY = 'some_kind_of_id';

  it('create alternative login for user', async () => {
    const res = await API.post(
      '/users/authenticate/alternative/create',
      { key: ALTERNATIVE_KEY, groupName: GROUP.groupName, username: USER.username },
    );

    helper.expectOk(res);
    expect(res.body.result.key).to.equal(ALTERNATIVE_KEY);
  });

  it('authenticate with alternative login', async () => {
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
    const res = await API.get('/users/authenticate/alternative/count', {
      username: USER.username,
      groupName: GROUP.groupName,
    });

    helper.expectOk(res);
    expect(res.body.result.count).to.equal(1);
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

    helper.expectOk(await API.get(`/groups/${GROUP.groupName}/members/${newUsername}`));
    expect(API.get(`/groups/${GROUP.groupName}/members/${USER.username}`)).to.eventually.be.rejected;

    // Reset username back to original
    await API.put('/users/reset/username', {
      oldUsername: newUsername,
      newUsername: USER.username,
      password: USER.password,
    });
  });

  it('get groups', async () => {
    const res = await API.get('/groups');
    helper.expectOk(res);
    expect(res.body.result).to.have.length(seed.data.groups.length);
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

  it('create group', async () => {
    const newGroup = 'new_group';

    // Create new group
    const res1 = await API.post(
      '/groups/create',
      { groupName: newGroup },
    );

    helper.expectOk(res1);
    expect(res1.body.result).to.equal(newGroup);

    // Check the group exists
    const res2 = await API.get('/groups');

    helper.expectOk(res2);
    expect(res2.body.result).to.have.length(seed.data.groups.length + 1);
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

  it('remove member from group', async () => {
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

  it('make transaction', async () => {
    const res = await API.post('/transaction', {
      username: USER.username,
      groupName: GROUP.groupName,
      amount: 1,
    });

    helper.expectOk(res);
    expect(res.body.result.saldo).to.equal(seed.meta.saldos[USER.username][GROUP.groupName] + 1);
  });

  it('get group transactions');
  it('get user transactions');
  it('get group saldo');
  it('get daily group saldo since');

  it('delete user', async () => {

    // Delete user
    const res1 = await API.del(
      '/users',
      { username: USER.username},
    );

    helper.expectOk(res1);

    // Check if he does still exists
    expect(API.get(`/users/${USER.username}`)).to.eventually.be.rejected;

    // Try delete user which does not exist
    const res2 = await API.del(
      '/users',
      { username: 'unknown_user'},
    );

    expect(API.del('/users', { username: 'unknown_user' })).to.eventually.be.rejected;
  });
});
