/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should } from 'chai';
import * as _ from 'lodash';
import * as path from 'path';

import * as helper from './helpers';
import { IConfig } from '../src/models/config';
import { ConflictError } from '../src/errors';
import * as transactionCore from '../src/core/transaction-core';
import * as userCore from '../src/core/user-core';
import * as  groupCore from '../src/core/group-core';

describe('Users, groups & transactions', () => {

  const USER = helper.user;
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
      await userCore.createUser(_.pick(USER, ['username', 'password']))
    } catch (err) {
      expect(err).to.have.property('name', 'ConflictError');
    }
  });

  it('authenticate user', async () => {
    const auth = await userCore.authenticateUser(USER);
    expect(auth).to.equal(true);
  });

  it('not authenticate user with wrong password', async () => {
    const auth = await userCore.authenticateUser(_.assign(USER, { password: 'wrong' }));
    expect(auth).to.equal(false);
  });

  it('create saldo for user', async () => {
    const user = await groupCore.addUserToGroup(USER.username, GROUP);
    expect(user).to.be.string;
  });

  it('make a transaction', async () => {
    const amount = 10;

    const trx1 = await transactionCore.makeTransaction({
      username: USER.username,
      groupName: GROUP,
      amount,
      tokenId: 1,
    });

    expect(trx1).to.have.property('username', USER.username);
    expect(trx1).to.have.property('saldo', amount);

    const user1 = await userCore.getUser(USER.username);
    expect(user1).to.containSubset({ saldos: { [GROUP]: amount } });

    const trx2 = await transactionCore.makeTransaction({
      username: USER.username,
      groupName: GROUP,
      amount: -amount,
      tokenId: 1,
    });

    expect(trx2).to.have.property('username', USER.username);
    expect(trx2).to.have.property('saldo', 0);

    const user2 = await userCore.getUser(USER.username);
    expect(user2).to.containSubset({ saldos: { [GROUP]: 0 } });
  });
});
