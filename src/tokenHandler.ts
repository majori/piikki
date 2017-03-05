import { Response, NextFunction } from 'express';
import * as _ from 'lodash';
import { getTokens, createAdminToken } from './core/token-core';
import { IExtendedRequest } from './app';
import * as Debug from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import { STATUS_CODES } from 'http';
import appInsights = require('applicationinsights');

const debug = Debug('piikki:tokenHandler');
const cfg = require('../config');

// If environment is not production, use development token
let registeredTokens = (cfg.isProduction || cfg.isTest) ?
    [] : [{ token: 'opensesame', role: 'global', group_name: null, comment: 'dev-token' }];

export function initTokens() {

    // Fetch tokens from database if no tokens registered
    if (_.isEmpty(registeredTokens)) {
        getTokens()
        .then((tokens) => {
            // There is no tokens in the database, make new ones
            if (_.isEmpty(tokens)) {
                debug('No tokens in database, creating an admin token');

                createAdminToken('Created on initialize')
                .then(updateTokens);

            } else {
                debug('Registered tokens:', tokens);
                updateTokens();
            }
        });
    }
};

// Authorize request by token found in "Authorization" header
export function handleTokens(req: IExtendedRequest, res: Response, next: NextFunction) {

    debug(`Handling token ${req.get('Authorization')}`);
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
            debug('Token had global access');
            req.piikki.groupAccess.all = true;

        // Set up admin level access
        } else if (token.role === 'admin') {
            debug('Token had admin access');
            req.piikki.admin.isAdmin = true;

        // Set up restricted group access
        } else {
            debug(`Token had restricted access to group "${token.group_name}"`);

            // Get group name from token
            req.piikki.groupAccess.group.name = token.group_name;
        }

        // Add token info to track requests
        appInsights.client.commonProperties = {
            token: token.token,
            token_role: token.role,
            token_comment: token.comment,
        };

        next();

    // Request didn't have a proper token
    } else {
        // Track unauthorized request
        appInsights.client.trackRequest(res, req);

        // Response with a unauthorized error
        const status = 401;
        res.status(status).json({
            ok: false,
            error: {
                code: status,
                message: STATUS_CODES[status],
            },
        });
    }
};

// Fetch current tokens from database
export function updateTokens() {
    getTokens()
    .then((tokens) => {
        registeredTokens = tokens;
        _writeTokensToFile();
    });
};

// Write tokens to prettified JSON file 
function _writeTokensToFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile(
            cfg.tokenFilePath,
            JSON.stringify(registeredTokens, null, '  '),
            'utf8',
            (err) => {
                if (err) {
                    console.error('Error when writing tokens to file: ', err);
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
};
