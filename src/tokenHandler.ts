import * as _ from 'lodash';
import { RequestHandler, Request } from 'express';
import { unauthorized } from 'boom';
import { getTokens, createAdminToken } from './core/token-core';
import { Logger } from './logger';

const logger = new Logger(__filename);

let registeredTokens: DatabaseToken[] = [];

export async function initTokens() {
  // Fetch tokens from database if no tokens registered
  if (_.isEmpty(registeredTokens)) {
    const tokens = await getTokens();

    // There is no tokens in the database, make new ones
    if (_.isEmpty(tokens)) {
      logger.info('Tokens not found, initializing admin token');
      await createAdminToken('Created on initialize');
    } else {
      await updateTokens(tokens);
    }
  }
}

// Authorize request by token found in "Authorization" header
export const handleTokens: RequestHandler = (req, res, next) => {
  const token = _.find(registeredTokens, { token: req.get('Authorization') });
  if (!_.isUndefined(token)) {
    req.piikki = {
      token,
      groupAccess: {
        all: false,
        group: { name: null },
      },
      admin: {
        isAdmin: false,
      },
    };

    // Set up global group access
    if (token.role === 'global') {
      req.piikki.groupAccess.all = true;

      // Set up admin level access
    } else if (token.role === 'admin') {
      req.piikki.admin.isAdmin = true;

      // Set up restricted group access
    } else {
      // Get group name from token
      req.piikki.groupAccess.group.name = token.group_name;
    }

    next();

    // Request didn't have a proper token
  } else {
    throw unauthorized();
  }
};

// Fetch current tokens from database
export async function updateTokens(newTokens?: DatabaseToken[]) {
  registeredTokens = (newTokens) ? newTokens : await getTokens();
  logger.debug('Refreshing tokens', { tokens: JSON.stringify(registeredTokens) });
}

export function getTokenInfo(req: Request) {
  return {
    token_role: _.get(req, 'piikki.token.role', ''),
    token_comment: _.get(req, 'piikki.token.comment', ''),
  };
}
