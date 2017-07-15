/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should, request } from 'chai';
import * as _ from 'lodash';
import { Express } from 'express';

import { NotFoundError } from '../../src/errors';
import { Config } from '../../src/models/config';
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

  it('reset password');
  it('reset username');

  it('get groups', async () => {
    const res = await API.get('/groups');
    helper.expectOk(res);
    expect(res.body.result).to.have.length(seed.data.groups.length);
  });

  it('get group members', async () => {
    const res = await API.get('/groups');
    helper.expectOk(res);
    expect(res.body.result).to.have.length(seed.meta.membersInGroup[GROUP.groupName]);
  });

  it('get group member', async () => {
    const res = await API.get(`/groups/${GROUP.groupName}/members/${USER.username}`)
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

  it('add member to group');
  it('remove member from group');
  it('make transaction');
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
  });
});
