import * as _ from 'lodash';
import * as tokenCore from '../core/token-core';
import { createJsonRoute } from '../utils/endpoint';
import validate from '../utils/validators';
import { Endpoint } from 'types/endpoints';

const endpoint: Endpoint = {
  createGlobalToken: async (req) => {
    const comment = req.body.comment;

    return tokenCore.createGlobalToken(comment);
  },

  createRestrictedToken: async (req) => {
    const groupName = validate.groupName(req.body.groupName);
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
export default _.mapValues(endpoint, createJsonRoute);
