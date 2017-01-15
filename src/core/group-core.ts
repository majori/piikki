import { QueryBuilder } from 'knex';
import * as _ from 'lodash';
import * as Promise from 'bluebird';

import { userExists } from './user-core';
import { createRestrictedToken } from './token-core';
import { knex, IDatabaseGroup, IDatabaseUser, IDatabaseUserSaldo } from '../database';

export function createGroup(groupName: string) {
    return knex('groups')
        .where({name: groupName})
        .then((records) => _.isEmpty(records) ?
            Promise.resolve() :
            Promise.reject(`Group ${groupName} already exists`)
        )
        .then(() => knex('groups').insert({ name: groupName }))
        .then(() => createRestrictedToken(groupName, 'Created for new group'))
        .then(() => Promise.resolve(groupName));
};

export function groupExists(groupName: string) {
    return knex('groups').where({ name: groupName }).first()
        .then((row: IDatabaseGroup) => _.isUndefined(row) ?
            Promise.reject(`Group ${groupName} not found`) :
            Promise.resolve(row)
        );
};

export function userIsNotInGroup(username: string, groupName: string) {
    return _userInGroup(username, groupName)
        .then((result: { found: boolean, user: IDatabaseUser, group: IDatabaseGroup}) => !result.found ?
            Promise.resolve({ user: result.user, group: result.group }) :
            Promise.reject(`User ${result.user.username} is already in group ${result.group.name}`)
        );
}

export function userIsInGroup(username: string, groupName: string) {
    return _userInGroup(username, groupName)
        .then((result: { found: boolean, user: IDatabaseUser, group: IDatabaseGroup}) => result.found ?
            Promise.resolve({ user: result.user, group: result.group }) :
            Promise.reject(`User ${result.user.username} is not in group ${result.group.name}`)
        );
}


export function getUsersFromGroup(groupName: string) {
    return knex
        .select('users.username', 'user_saldos.saldo')
        .from('users')
        .join('user_saldos', { 'user_saldos.user_id': 'users.id' })
        .join('groups', { 'groups.id': 'user_saldos.group_id' })
        .where({ 'groups.name': groupName });
};

export function getUserFromGroup(groupName: string, username: string) {
    return knex
        .select('users.username', 'user_saldos.saldo')
        .from('users')
        .join('user_saldos', { 'user_saldos.user_id': 'users.id' })
        .join('groups', { 'groups.id': 'user_saldos.group_id' })
        .where({ 'groups.name': groupName, 'users.username': username})
        .first();
};

export function getGroups() {
    return knex
        .from('groups')
        .select('name');
};

export function addUserToGroup(username: string, groupName: string) {
    return userIsNotInGroup(username, groupName)
        .then((res: { user: IDatabaseUser, group: IDatabaseGroup}) => knex
            .from('user_saldos')
            .insert({ group_id: res.group.id, user_id: res.user.id })
        )
        .then(() => Promise.resolve(username));
};

export function removeUserFromGroup(username: string, groupName: string) {
    return userIsInGroup(username, groupName)
        .then((res: { user: IDatabaseUser, group: IDatabaseGroup}) => knex
            .from('user_saldos')
            .where({user_id: res.user.id, group_id: res.group.id})
            .del()
        )
        .then(() => Promise.resolve(username));
};

function _userInGroup(username: string, groupName: string) {
    return Promise.all([
        userExists(username),
        groupExists(groupName)
    ])
    .spread((user: IDatabaseUser, group: IDatabaseGroup) => knex('user_saldos')
        .where({ user_id: user.id, group_id: group.id }).first()
        .then((row: IDatabaseUserSaldo) => Promise.resolve({
            found: !_.isUndefined(row),
            user,
            group
        }))
    )
};
