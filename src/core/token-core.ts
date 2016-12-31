import * as Promise from 'bluebird';
import * as crypto from 'crypto';
import * as _ from 'lodash';
import * as Debug from 'debug';

import { knex, IDatabaseGroup } from '../database';
import { groupExists, getGroups } from './group-core';

const debug = Debug('piikki:token-core');

export function createGroupToken(groupName: string, role: string, comment?: string) {
    role = (_.includes(['basic', 'supervisor'], role)) ? role : 'basic';

    return Promise.all([
            groupExists(groupName),
            generateBase64Token()
        ])
        .spread((group: IDatabaseGroup, token: string) => Promise
            .resolve()
            .then(() => knex
                .from('tokens')
                .insert({ token, role, comment })
                .returning('id')
            )
            .then((id) => knex
                .from('token_group_access')
                .insert({ 'token_id': id[0], 'group_id': group.id})
            )
            .then(() => { debug('Created group token', token); return Promise.resolve(); })
            .then(() => Promise.resolve(token))
        );
};

export function createGenericToken(comment?: string) {
    return generateBase64Token()
        .then((token) => knex.from('tokens').insert({ token, role: 'generic', comment }))
}

export function getTokens() {
    return knex
        .select('tokens.token', 'tokens.role', 'groups.name AS group_name')
        .from('tokens')
        .leftJoin('token_group_access', { 'token_group_access.token_id': 'tokens.id' })
        .leftJoin('groups', { 'groups.id': 'token_group_access.group_id' })
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

// Creates one generic token and token for every group
export function initializeTokens() {
    return createGenericToken()
        .then(getGroups)
        .then((groups) => Promise.each(groups, (group: any) => {
            return createGroupToken(group.name, 'basic');
        }))
        .then(getTokens);
};

function generateBase64Token(length = 32): Promise<any> {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(length, (err, buf) => {
            if (err) { reject(err); }

            resolve(buf.toString('base64'));
        });
    });
}