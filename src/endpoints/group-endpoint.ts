import * as _ from 'lodash';

import * as groupCore from '../core/group-core';
import * as userCore from '../core/user-core';
import { createJsonRoute, validateGroupName, validateUsername } from './endpoint-utils';

import { IDatabaseGroup, IDatabaseUser } from '../models/database';
import { IExtendedRequest } from '../models/http';

const _endpoint = {
  createGroup: async (req: IExtendedRequest) => {
    const groupName = validateGroupName(req.body.groupName);

    return groupCore.createGroup(groupName);
  },

  addMember: async (req: IExtendedRequest) => {
    const username = validateUsername(req.body.username);
    const groupName = validateGroupName(req.piikki.groupAccess.group.name);

    return groupCore.addUserToGroup(username, groupName);
  },

  removeMember: async (req: IExtendedRequest) => {
    const username = validateUsername(req.body.username);
    const groupName = validateGroupName(req.piikki.groupAccess.group.name);

    return groupCore.removeUserFromGroup(username, groupName);
  },

  getGroups: async (req: IExtendedRequest) => {
    return groupCore.getGroups();
  },

  getGroupMembers: async (req: IExtendedRequest) => {
    const groupName = validateGroupName(req.piikki.groupAccess.group.name);
    await groupCore.groupExists(groupName);

    return groupCore.getUsersFromGroup(groupName);
  },

  getGroupMember: async (req: IExtendedRequest) => {
    const username = validateUsername(req.params.username);
    const groupName = validateGroupName(req.piikki.groupAccess.group.name);

    const result = await groupCore.userIsInGroup(username, groupName);
    return groupCore.getUserFromGroup(result.group.name, result.user.username);
  },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
