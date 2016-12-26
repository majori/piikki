import * as Promise from 'bluebird';
import * as crypto from 'crypto';
import * as _ from 'lodash';

import { knex, IDatabaseGroup } from '../database';
import { groupExists } from './group-core';

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

function generateBase64Token(length = 32): Promise<any> {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(length, (err, buf) => {
            if (err) { reject(err); }

            resolve(buf.toString('base64'));
        });
    });
}