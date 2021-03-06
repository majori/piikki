import * as _ from 'lodash';
import { Endpoint } from 'types/endpoints';
import * as groupCore from '../core/group-core';
import { createJsonRoute } from '../utils/endpoint';
import validate from '../utils/validators';

const endpoint: Endpoint = {
  createGroup: async (req) => {
    const groupName = validate.groupName(req.body.groupName);
    const isPrivate = Boolean(_.get(req, 'body.private', false));

    return groupCore.createGroup(groupName, isPrivate);
  },

  addMember: async (req) => {
    const username = validate.username(req.body.username);
    const groupName = validate.groupName(req.piikki.groupAccess.group.name);

    // Only requests with global tokens require group passwords for private groups
    const password = req.piikki.groupAccess.all ? req.body.password : null;

    return groupCore.addUserToGroup(username, groupName, password);
  },

  removeMember: async (req) => {
    const username = validate.username(req.body.username);
    const groupName = validate.groupName(req.piikki.groupAccess.group.name);

    return groupCore.removeUserFromGroup(username, groupName);
  },

  getGroups: async (req) => {
    return groupCore.getGroups(validate.bool(req.query.all));
  },

  getGroup: async (req) => {
    const filter = !_.isNaN(+req.params.identifier)
      ? { id: validate.id(+req.params.identifier) }
      : { name: validate.groupName(req.params.identifier) };
    return groupCore.getGroup(filter);
  },

  getCurrentGroup: async (req) => {
    const groupName = req.piikki.groupAccess.group.name;

    if (groupName) {
      return await groupCore.getGroup({ name: groupName });
    }
  },

  getGroupMembers: async (req) => {
    const groupName = validate.groupName(req.piikki.groupAccess.group.name);
    await groupCore.groupExists(groupName);

    return groupCore.getUsersFromGroup(groupName);
  },

  getGroupMember: async (req) => {
    const username = validate.username(req.params.username);
    const groupName = validate.groupName(req.piikki.groupAccess.group.name);

    const result = await groupCore.userIsInGroup(username, groupName);
    return groupCore.getUserFromGroup(result.group.name, result.user.username);
  },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(endpoint, createJsonRoute);
