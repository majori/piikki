import * as bcrypt from 'bcrypt';
import * as Promise from 'bluebird';
import { QueryBuilder } from 'knex';
import * as _ from 'lodash';

import { knex, IDatabaseUser, IDatabaseGroup } from '../database';
import { IUserDto, saltRounds } from './core-utils';
import { groupExists } from './group-core';

// Get all users in group
export function getUsers() {
    return knex
        .select('username')
        .from('users')
        .where({ active: true });
};

// Get user info and saldo in each group
export function getUser(username: String) {
    let user = { username, saldos: {} };

    return userExists(username)

        // Fetch possible saldos in groups
        .then(() => knex
            .from('users')
            .join('user_saldos', { 'user_saldos.user_id': 'users.id' })
            .join('groups', { 'groups.id': 'user_saldos.group_id' })
            .select('users.username', 'groups.name AS groupName', 'user_saldos.saldo')
            .where({ 'users.username': username, 'users.active': true })
            .then((results) => {

                // There was no saldos, return only user info
                if (_.isEmpty(results)) { return Promise.resolve(user) };

                // Parse database rows to saldos object
                return Promise.resolve(_.reduce(results, (result: any, value: any) => {
                    result.saldos[value.groupName] =  value.saldo;
                    return result;
                }, user));
            })
        );
};

// Create new user
export function createUser(user: IUserDto) {
    return knex('users').where({username: user.username})
        .then((records) => _.isEmpty(records) ?
            Promise.resolve() :
            Promise.reject(`Username ${user.username} already exists`)
        )
        .then(() => knex('users').insert({
            username: user.username,
            password: bcrypt.hashSync(user.password, saltRounds)
        }));
};

// Puts user's "active" -status to false
export function deleteUser(username: String) {
    return knex('users').where({ username }).update({ active: false })
        .then(() => Promise.resolve());
}

// Compare raw password with the hashed one
export function authenticateUser(user: IUserDto) {
    return userExists(user.username)
    .then((row) => bcrypt.compareSync(user.password, row.password) ?
        Promise.resolve() :
        Promise.reject('Invalid password'),
    );
};

export function createSaldoForUser(username: String, groupName: String) {
    return Promise.all([
        userExists(username),
        groupExists(groupName)
    ])
    .spread((user: IDatabaseUser, group: IDatabaseGroup) => knex('user_saldos')
        .insert({group_id: group.id, user_id: user.id})
    );
};

// Checks if user is in database
export function userExists(username: String) {
    return knex('users').where({ username }).first()
        .then((row) => _.isUndefined(row) ?
            Promise.reject(`User ${username} not found`) :
            Promise.resolve(row)
        );
};
