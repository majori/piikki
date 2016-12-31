import { Response, NextFunction } from 'express';
import * as _ from 'lodash';
import { getTokens, initializeTokens } from './core/token-core';
import { IExtendedRequest } from './app';
import * as Debug from 'debug';

const debug = Debug('piikki:tokenHandler');
const cfg = require('../config');

// If environment is not production, use development token
let registeredTokens = (cfg.isProduction || cfg.isTest) ?
    [] : [{ token: 'opensesame', role: 'generic', groupName: null }];

export function initTokens() {

    // Fetch tokens from database if no tokens registered
    if (_.isEmpty(registeredTokens)) {
        getTokens()
        .then((tokens) => {
            // There is no tokens in the database, make new ones
            if (_.isEmpty(tokens)) {
                debug('No tokens in database, creating new ones');

                initializeTokens()
                .then((tokens) => {
                    registeredTokens = tokens;
                });

            } else {
                debug('Registered tokens:', tokens);
                registeredTokens = tokens;
            }
        });
    }
};

export function handleTokens(req: IExtendedRequest, res: Response, next: NextFunction) {

    debug(`Handling token ${req.get('Authorization')}`);
    let token = _.find(registeredTokens, ['token', req.get('Authorization')]);
    if (!_.isUndefined(token)) {

        req.groupAccess = { all: false, group: { elevated: false, name: null }};
        let role = token.role;

        // Generic token have access to all groups
        if (role === 'generic') {
            req.groupAccess.all = true;

        } else {

            // Get group name from token
            req.groupAccess.group.name = token.groupName;

            // Elevate group access if role is supervisor
            if (role === 'supervisor') {
                req.groupAccess.group.elevated = true;
            }
        }

        next();

    } else {
        res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
};

// Fetch current tokens from database
function updateTokens() {
    getTokens()
    .then((tokens) => {
        registeredTokens = tokens;
    });
}
