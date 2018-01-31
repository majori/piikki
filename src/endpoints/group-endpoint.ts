import * as _ from 'lodash';
import { Endpoint } from 'types/endpoints';
import * as groupCore from '../core/group-core';
import { createJsonRoute, validateGroupName, validateUsername } from './endpoint-utils';

const endpoint: Endpoint = {
  createGroup: async (req) => {
    const groupName = validateGroupName(req.body.groupName);

    return groupCore.createGroup(groupName);
  },

  addMember: async (req) => {
    const username = validateUsername(req.body.username);
    const groupName = validateGroupName(req.piikki.groupAccess.group.name);

    return groupCore.addUserToGroup(username, groupName);
  },

  removeMember: async (req) => {
    const username = validateUsername(req.body.username);
    const groupName = validateGroupName(req.piikki.groupAccess.group.name);

    return groupCore.removeUserFromGroup(username, groupName);
  },

  getGroups: async (req) => {
    return groupCore.getGroups();
  },

  getGroupMembers: async (req) => {
    const groupName = validateGroupName(req.piikki.groupAccess.group.name);
    await groupCore.groupExists(groupName);

    return groupCore.getUsersFromGroup(groupName);
  },

  getGroupMember: async (req) => {
    const username = validateUsername(req.params.username);
    const groupName = validateGroupName(req.piikki.groupAccess.group.name);

    const result = await groupCore.userIsInGroup(username, groupName);
    return groupCore.getUserFromGroup(result.group.name, result.user.username);
  },

  getCurrentGroup: async (req) => {
    const groupName = req.piikki.groupAccess.group.name;

    if (groupName) {
      return await groupCore.getGroup(groupName);
    }
  },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(endpoint, (func) => createJsonRoute(func));
