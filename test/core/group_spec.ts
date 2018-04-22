/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should } from 'chai';
import * as _ from 'lodash';
import { isBoom } from 'boom';

import * as seed from '../../seeds/data/test';
import * as helper from '../helpers';
import * as userCore from '../../src/core/user-core';
import * as groupCore from '../../src/core/group-core';

describe('Groups', () => {

  const USER = _.clone(helper.user);
  const USER_NOT_IN_GROUP = _.clone(seed.data.users[2]);
  const USER_NOT_IN_ANY_GROUP = _.clone(seed.data.users[3]);

  const GROUP = _.clone(helper.group);
  const NEW_GROUP_NAME = 'new_group';

  beforeEach(helper.clearDbAndRunSeed);

  it('create a new group', async () => {
    const group = await groupCore.createGroup(NEW_GROUP_NAME, false);
    expect(group).to.have.property('groupName', NEW_GROUP_NAME);
    expect(group).to.have.property('token');

    expect(await groupCore.groupExists(NEW_GROUP_NAME)).to.containSubset({ name: NEW_GROUP_NAME });
  });

  it('create a new private group', async () => {
    await groupCore.createGroup(NEW_GROUP_NAME, true);

    const groups = await groupCore.getGroups(false);
    expect(groups).to.have.length(seed.data.groups.length);

    const allGroups = await groupCore.getGroups(true);
    expect(allGroups).to.have.length(seed.data.groups.length + 1);
  });

  it('not create a group with existing name', async () => {
    try {
      await groupCore.createGroup(GROUP.groupName, false);
      throw new Error('Group dublicate');
    } catch (err) {
      expect(isBoom(err)).to.be.true;
      expect(err.message).to.contain(GROUP.groupName);
    }
  });

  it('create saldo for user', async () => {
    const user = await groupCore.addUserToGroup(USER_NOT_IN_GROUP.username, GROUP.groupName);
    expect(user).to.be.string;
  });

  it('will set user\'s default group to new group if user has no other groups', async () => {
    let user = await userCore.getUser(USER_NOT_IN_ANY_GROUP.username);
    expect(user).to.have.property('defaultGroup', null);

    await groupCore.addUserToGroup(USER_NOT_IN_ANY_GROUP.username, GROUP.groupName);

    user = await userCore.getUser(USER_NOT_IN_ANY_GROUP.username);
    expect(user).to.have.property('defaultGroup', GROUP.groupName);
  });

  it('will not set user\'s default group to new group if user has already a default group', async () => {
    await groupCore.addUserToGroup(USER_NOT_IN_GROUP.username, GROUP.groupName);

    const user = await userCore.getUser(USER_NOT_IN_GROUP.username);
    expect(user).to.not.have.property('defaultGroup', GROUP.groupName);
  });

  it('will reset user\'s default group if he is removed from group', async () => {
    await userCore.setDefaultGroup(USER.username, GROUP.groupName);
    await groupCore.removeUserFromGroup(USER.username, GROUP.groupName);
    const user = await userCore.getUser(USER.username);

    expect(user).to.have.property('defaultGroup', null);
  });
});
