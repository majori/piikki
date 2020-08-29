/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect } from 'chai';
import * as _ from 'lodash';
import { isBoom } from 'boom';

import * as helper from '../helpers';
import * as userCore from '../../src/core/user-core';
import * as groupCore from '../../src/core/group-core';

describe('Users', () => {
  const USER = _.clone(helper.user);
  const GROUP = 'new_group';

  beforeEach(helper.clearDbAndRunSeed);

  it('create a new user', async () => {
    const newUser = { username: 'new_user', password: '1234' };
    await userCore.createUser(newUser);
    const user = await userCore.userExists(newUser.username);

    expect(user).to.containSubset({ username: user.username });
  });

  it('delete user', async () => {
    await userCore.deleteUser(USER.username);
    try {
      await userCore.userExists(USER.username);
      throw new Error('Deleted user exists');
    } catch (err) {
      expect(isBoom(err)).to.be.true;
      expect(err.output.payload.error).to.equal('Not Found');
    }
  });

  it('not create a user with existing name', async () => {
    try {
      await userCore.createUser(USER); // Seed data already contains this user
      throw new Error('User dublicate');
    } catch (err) {
      expect(isBoom(err)).to.be.true;
      expect(err.message).to.contain(USER.username);
    }
  });

  it('authenticate user', async () => {
    const auth = await userCore.authenticateUser(USER);
    expect(auth).to.equal(true);
  });

  it('not authenticate user with wrong password', async () => {
    const auth = await userCore.authenticateUser({
      username: USER.username,
      password: 'wrong',
    });
    expect(auth).to.equal(false);
  });

  it('does not throw an error even if user was not found', async () => {
    const auth = await userCore.authenticateUser({
      username: 'unknown_user',
      password: 'wrong',
    });
    expect(auth).to.equal(false);
  });
});
