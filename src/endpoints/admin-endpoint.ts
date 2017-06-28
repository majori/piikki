import * as _ from 'lodash';

import * as tokenCore from '../core/token-core';
import { createJsonRoute, validateGroupName } from './endpoint-utils';

import { IExtendedRequest } from '../models/http';

const _endpoint = {
  createGlobalToken: async (req: IExtendedRequest) => {
    const comment = req.body.comment;

    return tokenCore.createGlobalToken(comment);
  },

  createRestrictedToken: async (req: IExtendedRequest) => {
    const groupName = validateGroupName(req.body.groupName);
    const comment = req.body.comment;

    return tokenCore.createRestrictedToken(groupName, comment);
  },

  createAdminToken: async (req: IExtendedRequest) => {
    const comment = req.body.comment;

    return tokenCore.createAdminToken(comment);
  },

  deleteToken: async (req: IExtendedRequest) => {
    const token = req.body.token;

    return tokenCore.deleteToken(token);
  },

  getTokens: async (req: IExtendedRequest) => tokenCore.getTokens(),

};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
