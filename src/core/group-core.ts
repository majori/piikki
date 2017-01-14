import { QueryBuilder } from 'knex';
import * as _ from 'lodash';
import * as Promise from 'bluebird';

import { userExists } from './user-core';
import { createGroupToken } from './token-core';
import { knex, IDatabaseGroup, IDatabaseUser, IDatabaseUserSaldo } from '../database';

export function createGroup(groupName: string) {
    return knex('groups')
        .where({name: groupName})
        .then((records) => _.isEmpty(records) ?
            Promise.resolve() :
            Promise.reject(`Group ${groupName} already exists`)
        )
        .then(() => knex('groups').insert({ name: groupName }))
        .then(() => createGroupToken(groupName, 'basic')) // Create automatically access token for group
        .then(() => Promise.resolve(groupName));
};

export function groupExists(groupName: string) {
    return knex('groups').where({ name: groupName }).first()
        .then((row: IDatabaseGroup) => _.isUndefined(row) ?
            Promise.reject(`Group ${groupName} not found`) :
            Promise.resolve(row)
        );
};

export function userIsAlreadyInGroup(username: string, groupName: string) {
    return Promise.all([
        userExists(username),
        groupExists(groupName)
    ])
    .spread((user: IDatabaseUser, group: IDatabaseGroup) => knex('user_saldos')
        .where({ user_id: user.id, group_id: group.id }).first()
        .then((row: IDatabaseUserSaldo) => !_.isUndefined(row) ?
            Promise.reject(`User ${user.username} is already in group ${group.name}`) :
            Promise.resolve({ user, group })
        )
    )
};

export function getUsersFromGroup(groupName: string) {
    return knex
        .select('users.username')
        .from('users')
        .join('user_saldos', { 'user_saldos.user_id': 'users.id' })
        .join('groups', { 'groups.id': 'user_saldos.group_id' })
        .where({ 'groups.name': groupName });
};

export function getGroups() {
    return knex
        .from('groups')
        .select('name');
};

export function addUserToGroup(username: string, groupName: string) {
    return userIsAlreadyInGroup(username, groupName)
    .then((res: { user: IDatabaseUser, group: IDatabaseGroup}) => knex
        .from('user_saldos')
        .insert({group_id: res.group.id, user_id: res.user.id})
    )
    .then(() => Promise.resolve(username));
};
