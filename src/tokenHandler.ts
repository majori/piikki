import { Response, NextFunction } from 'express';
import * as _ from 'lodash';
import { getTokens, createGlobalToken } from './core/token-core';
import { IExtendedRequest } from './app';
import * as Debug from 'debug';
import * as fs from 'fs';
import * as path from 'path';

const debug = Debug('piikki:tokenHandler');
const cfg = require('../config');

// If environment is not production, use development token
let registeredTokens = (cfg.isProduction || cfg.isTest) ?
    [] : [{ token: 'opensesame', role: 'global', group_name: null }];

export function initTokens() {

    // Fetch tokens from database if no tokens registered
    if (_.isEmpty(registeredTokens)) {
        getTokens()
        .then((tokens) => {
            // There is no tokens in the database, make new ones
            if (_.isEmpty(tokens)) {
                debug('No tokens in database, creating new ones');

                createGlobalToken('Created on initialize')
                .then(updateTokens);

            } else {
                debug('Registered tokens:', tokens);
                updateTokens();
            }
        });
    }
};

export function handleTokens(req: IExtendedRequest, res: Response, next: NextFunction) {

    debug(`Handling token ${req.get('Authorization')}`);
    const token = _.find(registeredTokens, ['token', req.get('Authorization')]);
    if (!_.isUndefined(token)) {

        req.groupAccess = { all: false, group: { name: null }};

        // Global token have access to all groups
        if (token.role === 'global') {
            debug('Token had global access');
            req.groupAccess.all = true;

        } else {
            debug(`Token had restricted access to group "${token.group_name}"`);

            // Get group name from token
            req.groupAccess.group.name = token.group_name;
        }

        next();

    // Request didn't have a proper token
    } else {
        res.status(401).json({ ok: false, message: 'Unauthorized' });
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

function _writeTokensToFile() {
    fs.writeFile(
        path.join(cfg.buildDir, 'tokens.json'),
        JSON.stringify(registeredTokens, null, '  '),
        'utf8',
        (err) => { if (err) { console.error('Error when writing tokens to file: ', err); }}
    );
};
