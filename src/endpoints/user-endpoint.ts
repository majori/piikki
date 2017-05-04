import * as _ from 'lodash';
import { NextFunction, Response } from 'express';
import { IExtendedRequest } from '../app';

import * as userCore from '../core/user-core';
import { ConflictError } from '../errors';
import { createJsonRoute, validateUser, validateUsername, validateGroupName, validatePassword } from './endpoint-utils';

const _endpoint = {

  getUsers: async (req: IExtendedRequest) => {
    return userCore.getUsers();
  },

  getUser: async (req: IExtendedRequest) => {
    const username = validateUsername(req.params.username);

    return userCore.getUser(username);
  },

  createUser: async (req: IExtendedRequest) => {
    const user = validateUser(req.body);

    return userCore.createUser(user);
  },

  authenticateUser: async (req: IExtendedRequest) => {
    const user = validateUser(req.body);

    const authenticated = await userCore.authenticateUser(user);
    return { authenticated };
  },

  deleteUser: async (req: IExtendedRequest) => {
    const username = validateUsername(req.body.username);

    return userCore.deleteUser(username);
  },

  resetPassword: async (req: IExtendedRequest) => {
    const user: userCore.IUserDto = validateUser({
      username: req.body.username,
      password: req.body.oldPassword,
    });
    const newPassword = validatePassword(req.body.newPassword);

    return userCore.resetPassword(user, newPassword)
  },

  forceResetPassword: async (req: IExtendedRequest) => {
    const username = validateUsername(req.body.username);
    const newPassword = validatePassword(req.body.newPassword);

    return userCore.forceResetPassword(username, newPassword);
  },

  resetUsername: async (req: IExtendedRequest) => {
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
};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
