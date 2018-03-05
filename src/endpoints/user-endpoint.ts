import * as _ from 'lodash';

import * as userCore from '../core/user-core';
import { ConflictError } from '../errors';
import { Endpoint } from 'types/endpoints';
import { createJsonRoute } from '../utils/endpoint';
import {
  validateAlternativeLoginKey, validateGroupName, validatePassword, validateUser,
  validateUsername,
} from '../utils/validators';

const endpoint: Endpoint = {

  getUsers: async (req) => {
    return userCore.getUsers();
  },

  getUser: async (req) => {
    const username = validateUsername(req.params.username);

    return userCore.getUser(username);
  },

  createUser: async (req) => {
    const user = validateUser(req.body);

    return userCore.createUser(user);
  },

  authenticateUser: async (req) => {
    const user = validateUser(req.body);

    const authenticated = await userCore.authenticateUser(user);
    return { username: user.username, authenticated };
  },

  alternativeAuthenticateUser: async (req) => {
    const type = req.body.type;
    const groupName = validateGroupName(
      (req.piikki.groupAccess.all) ? req.body.groupName : req.piikki.groupAccess.group.name,
    );
    const key = validateAlternativeLoginKey(req.body.key);

    const found = await userCore.getAlternativeLogin({
      key,
      type,
      groupName,
      tokenId: req.piikki.token.id,
    });
    return _.isEmpty(found) ?
      { authenticated: false } :
      {
        authenticated: true,
        username: found.username,
        groupName,
      };
  },

  createAlternativeLogin: async (req) => {
    const type = req.body.type;
    const username = validateUsername(req.body.username);
    const groupName = validateGroupName(
      (req.piikki.groupAccess.all) ? req.body.groupName : req.piikki.groupAccess.group.name,
    );
    const key = validateAlternativeLoginKey(req.body.key);

    await userCore.createAlternativeLogin({
      username,
      key,
      type,
      groupName,
      tokenId: req.piikki.token.id,
    });

    return { type, key, username, groupName  };
  },

  getAlternativeLoginCount: async (req) => {
    const type = req.query.type;
    const username = validateUsername(req.query.username);
    const groupName = validateGroupName(
      (req.piikki.groupAccess.all) ? req.query.groupName : req.piikki.groupAccess.group.name,
    );

    const rows: DatabaseAlternativeLogin[] = await userCore.getAlternativeLoginsForUser({ groupName, username, type });

    return {
      count: _.size(rows),
    };
  },

  deleteUser: async (req) => {
    const username = validateUsername(req.body.username);

    return userCore.deleteUser(username);
  },

  resetPassword: async (req) => {
    const user: UserDto = validateUser({
      username: req.body.username,
      password: req.body.oldPassword,
    });
    const newPassword = validatePassword(req.body.newPassword);

    return userCore.resetPassword(user, newPassword);
  },

  forceResetPassword: async (req) => {
    const username = validateUsername(req.body.username);
    const newPassword = validatePassword(req.body.newPassword);

    return userCore.forceResetPassword(username, newPassword);
  },

  resetUsername: async (req) => {
    const oldUsername = validateUsername(req.body.oldUsername);
    const newUsername = validateUsername(req.body.newUsername);
    const password = validatePassword(req.body.password);

    const auth = await userCore.authenticateUser({ username: oldUsername, password });
    if (auth) {
      return userCore.resetUsername(oldUsername, newUsername);
    } else {
      throw new ConflictError('Invalid password');
    }
  },

  setDefaultGroup: async (req) => {
    const username = validateUsername(req.params.username);
    const groupName = validateGroupName(req.body.groupName);

    return userCore.setDefaultGroup(username, groupName);
  },

  resetDefaultGroup: async (req) => {
    return userCore.resetDefaultGroup(validateUsername(req.params.username));
  },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(endpoint, createJsonRoute);
