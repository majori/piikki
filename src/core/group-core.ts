import { QueryBuilder } from 'knex';
import * as _ from 'lodash';

import { knex, IDatabaseGroup } from '../database';

export function createGroup(groupName: String) {
    return knex('groups')
        .where({name: groupName})
        .then((records) => _.isEmpty(records) ?
            Promise.resolve() :
            Promise.reject(`Group ${groupName} already exists`)
        )
        .then(() => knex('groups').insert({ name: groupName }));
};

export function groupExists(groupName: String): Promise<any> {
    return knex('groups').where({ name: groupName }).first()
        .then((row: IDatabaseGroup) => _.isUndefined(row) ?
            Promise.reject(`Group ${groupName} not found`) :
            Promise.resolve(row)
        );
};

export function getUsersFromGroup(groupName: String) {
    return knex
        .select('users.username')
        .from('users')
        .join('user_saldos', { 'user_saldos.user_id': 'users.id' })
        .join('groups', { 'groups.id': 'user_saldos.group_id' })
        .where({ 'groups.name': groupName });
};