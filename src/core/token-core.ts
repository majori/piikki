import * as Promise from 'bluebird';
import * as crypto from 'crypto';
import * as _ from 'lodash';
import * as Debug from 'debug';

import { knex, IDatabaseGroup } from '../database';
import { groupExists, getGroups } from './group-core';
import { updateTokens} from '../tokenHandler';

const debug = Debug('piikki:token-core');

export function createRestrictedToken(groupName: string, comment?: string) {

    return Promise.all([
            groupExists(groupName),
            _generateBase64Token()
        ])
        .spread((group: IDatabaseGroup, token: string) => Promise
            .resolve()
            .then(() => knex
                .from('tokens')
                .insert({ token, role: 'restricted', comment })
                .returning('id')
            )
            .then((id) => knex
                .from('token_group_access')
                .insert({ 'token_id': id[0], 'group_id': group.id})
            )
            .then(() => {
                debug('Created restricted token', token);
                updateTokens(); // Inform token handler about new token
                return Promise.resolve()
            })
            .then(() => Promise.resolve(token))
        );
};

export function createGlobalToken(comment?: string) {
    return _generateBase64Token()
        .then((token) => knex
            .from('tokens')
            .insert({ token, role: 'global', comment })
            .then(() => {
                debug('Created global token', token);
                updateTokens(); // Inform token handler about new token
                return Promise.resolve();
            })
            .then(() => Promise.resolve(token))
        );
}

export function createAdminToken(comment?: string) {
    return _generateBase64Token(64)
        .then((token) => knex
            .from('tokens')
            .insert({ token, role: 'admin', comment })
            .then(() => {
                debug('Created admin token', token);
                updateTokens(); // Inform token handler about new token
                return Promise.resolve();
            })
            .then(() => Promise.resolve(token))
        );
}

export function getTokens() {
    return knex
        .select('tokens.token', 'tokens.role', 'groups.name AS group_name', 'tokens.comment')
        .from('tokens')
        .leftJoin('token_group_access', { 'token_group_access.token_id': 'tokens.id' })
        .leftJoin('groups', { 'groups.id': 'token_group_access.group_id' });
}

export function getToken(groupName: string) {
    return knex
        .select('tokens.token', 'tokens.role', 'groups.name AS group_name')
        .from('tokens')
        .leftJoin('token_group_access', { 'token_group_access.token_id': 'tokens.id' })
        .leftJoin('groups', { 'groups.id': 'token_group_access.group_id' })
        .where({ 'groups.name': groupName })
        .first();
}

// Creates one global token and restricted token for every group
export function initializeTokens() {
    return createGlobalToken()
        .then(getGroups)
        .then((groups) => Promise.each(groups, (group: any) => {
            return createRestrictedToken(group.name);
        }))
        .then(getTokens);
};

// Generates Base64 string from random bytes
function _generateBase64Token(length = 32): Promise<any> {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(length, (err, buf) => {
            if (err) { reject(err); }

            resolve(buf.toString('base64'));
        });
    });
}