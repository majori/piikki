import * as _ from 'lodash';
import * as path from 'path';
import { STATUS_CODES } from 'http';
import appInsights = require('applicationinsights');
import { getTokens, createAdminToken } from './core/token-core';
import { AuthorizationError } from './errors';

import { Response, NextFunction } from 'express';
import { IExtendedRequest } from './models/http';
import { IDatabaseToken } from './models/database';

// If environment is not production, use development token
let registeredTokens: IDatabaseToken[] = [];

export async function initTokens() {

  // Fetch tokens from database if no tokens registered
  if (_.isEmpty(registeredTokens)) {
    const tokens = await getTokens();

    // There is no tokens in the database, make new ones
    if (_.isEmpty(tokens)) {
      await createAdminToken('Created on initialize');
    }

    await updateTokens();
  }
}

// Authorize request by token found in "Authorization" header
export function handleTokens(req: IExtendedRequest, res: Response, next: NextFunction) {

  const token = _.find(registeredTokens, ['token', req.get('Authorization')]);
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

    // Add token info to track requests
    appInsights.client.commonProperties = {
      token: token.token,
      token_role: token.role,
      token_comment: token.comment || '',
    };

    next();

    // Request didn't have a proper token
  } else {

    // Set status to unauthorized
    res.status(401);

    // Track unauthorized request if the request is not from azure ping service
    if (!_.includes(['52.178.179.0'], req.connection.remoteAddress)) {
      appInsights.client.trackRequestSync(req, res, (Date.now() - req.insights.startTime));
    }

    throw new AuthorizationError();
  }
}

// Fetch current tokens from database
export function updateTokens() {
  getTokens()
    .then((tokens) => {
      registeredTokens = tokens;
    });
}
