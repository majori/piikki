/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should } from 'chai';
import * as _ from 'lodash';
import * as path from 'path';

import * as helper from '../helpers';
import { Config } from '../../src/models/config';
import { ConflictError } from '../../src/errors';
import * as userCore from '../../src/core/user-core';
import * as groupCore from '../../src/core/group-core';

describe('Users & groups', () => {

  const USER = _.clone(helper.user);
  const GROUP = 'new_group';

  before(helper.clearDbAndRunSeed);

  it('create a new group', async () => {
    await groupCore.createGroup(GROUP);
    const group = await groupCore.groupExists(GROUP);

    expect(group).to.containSubset({ name: GROUP });
  });

  it('not create a group with existing name', async () => {
    try {
      await groupCore.createGroup(GROUP);
    } catch (err) {
      expect(err).to.have.property('name', 'ConflictError');
    }
  });

  it('create a new user', async () => {
    const newUser = { username: 'new_user', password: '1234' };
    await userCore.createUser(newUser);
    const user = await userCore.userExists(newUser.username);

    expect(user).to.containSubset({ username: user.username });
  });

  it('not create a user with existing name', async () => {
    try {
      await userCore.createUser(USER);
    } catch (err) {
      expect(err).to.have.property('name', 'ConflictError');
    }
  });

  it('authenticate user', async () => {
    const auth = await userCore.authenticateUser(USER);
    expect(auth).to.equal(true);
  });

  it('not authenticate user with wrong password', async () => {
    const auth = await userCore.authenticateUser({ username: USER.username, password: 'wrong' });
    expect(auth).to.equal(false);
  });

  it('create saldo for user', async () => {
    const user = await groupCore.addUserToGroup(USER.username, GROUP);
    expect(user).to.be.string;
  });
});