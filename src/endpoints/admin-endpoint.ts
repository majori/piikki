import * as _ from 'lodash';
import * as tokenCore from '../core/token-core';
import { createJsonRoute, validateGroupName } from './endpoint-utils';
import { Endpoint } from 'types/endpoints';

const endpoint: Endpoint = {
  createGlobalToken: async (req) => {
    const comment = req.body.comment;

    return tokenCore.createGlobalToken(comment);
  },

  createRestrictedToken: async (req) => {
    const groupName = validateGroupName(req.body.groupName);
    const comment = req.body.comment;

    return tokenCore.createRestrictedToken(groupName, comment);
  },

  createAdminToken: async (req) => {
    const comment = req.body.comment;

    return tokenCore.createAdminToken(comment);
  },

  deleteToken: async (req) => {
    const token = req.body.token;

    return tokenCore.deleteToken(token);
  },

  getTokens: async (req) => tokenCore.getTokens(),

};

// Wrap endpoint to produce JSON route
export default _.mapValues(endpoint, (func) => createJsonRoute(func));
