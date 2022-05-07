import * as _ from 'lodash';
import { badRequest } from 'boom';

import * as userCore from '../core/user-core';
import { Endpoint } from 'types/endpoints';
import { createJsonRoute } from '../utils/endpoint';
import validate from '../utils/validators';

const endpoint: Endpoint = {
  getUsers: async (req) => {
    return userCore.getUsers();
  },

  getUser: async (req) => {
    const username = validate.username(req.params.username);

    return userCore.getUser(username);
  },

  createUser: async (req) => {
    const user = validate.user(req.body);

    return userCore.createUser(user);
  },

  authenticateUser: async (req) => {
    const user = validate.auth(req.body);

    const authenticated = await userCore.authenticateUser(user);
    return { username: user.username, authenticated };
  },

  alternativeAuthenticateUser: async (req) => {
    const type = req.body.type;
    const groupName: string | null =
      req.piikki.groupAccess.all && !_.has(req, 'body.groupName')
        ? null
        : validate.groupName(
            req.piikki.groupAccess.all
              ? req.body.groupName
              : req.piikki.groupAccess.group.name,
          );
    const key = validate.alternativeLoginKey(req.body.key);

    const found = await userCore.getAlternativeLogin({
      key,
      type,
      groupName,
      tokenId: req.piikki.token.id,
    });
    return _.isEmpty(found)
      ? { authenticated: false }
      : {
          authenticated: true,
          username: found.username,
          groupName,
        };
  },

  createAlternativeLogin: async (req) => {
    const type = req.body.type;
    const username = validate.username(req.body.username);
    const groupName: string | null =
      req.piikki.groupAccess.all && !_.has(req, 'body.groupName')
        ? null
        : validate.groupName(
            req.piikki.groupAccess.all
              ? req.body.groupName
              : req.piikki.groupAccess.group.name,
          );
    const key = validate.alternativeLoginKey(req.body.key);

    await userCore.createAlternativeLogin({
      username,
      key,
      type,
      groupName,
      tokenId: req.piikki.token.id,
    });

    return { type, key, username, groupName };
  },

  getAlternativeLoginCount: async (req) => {
    const type = _.toNumber(req.query.type);
    const username = validate.username(req.query.username as string);
    const groupName: string | null =
      req.piikki.groupAccess.all && !_.has(req, 'body.groupName')
        ? null
        : validate.groupName(
            req.piikki.groupAccess.all
              ? req.body.groupName
              : req.piikki.groupAccess.group.name,
          );

    const rows: DatabaseAlternativeLogin[] =
      await userCore.getAlternativeLoginsForUser({ groupName, username, type });

    return {
      count: _.size(rows),
    };
  },

  deleteUser: async (req) => {
    const username = validate.username(req.body.username);

    return userCore.deleteUser(username);
  },

  resetPassword: async (req) => {
    const user: UserDto = validate.user({
      username: req.body.username,
      password: req.body.oldPassword,
    });
    const newPassword = validate.password(req.body.newPassword);

    return userCore.resetPassword(user, newPassword);
  },

  forceResetPassword: async (req) => {
    const username = validate.username(req.body.username);
    const newPassword = validate.password(req.body.newPassword);

    return userCore.forceResetPassword(username, newPassword);
  },

  resetUsername: async (req) => {
    const oldUsername = validate.username(req.body.oldUsername);
    const newUsername = validate.username(req.body.newUsername);
    const password = validate.password(req.body.password);

    const auth = await userCore.authenticateUser({
      username: oldUsername,
      password,
    });
    if (auth) {
      return userCore.resetUsername(oldUsername, newUsername);
    } else {
      throw badRequest('Invalid password');
    }
  },

  setDefaultGroup: async (req) => {
    const username = validate.username(req.params.username);
    const groupName = validate.groupName(req.body.groupName);

    return userCore.setDefaultGroup(username, groupName);
  },

  resetDefaultGroup: async (req) => {
    return userCore.resetDefaultGroup(validate.username(req.params.username));
  },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(endpoint, createJsonRoute);
