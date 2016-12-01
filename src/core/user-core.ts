import * as bcrypt from 'bcrypt';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

import { knex } from '../database';
import { IUser, saltRounds } from './core-utils';

// Get all users in group
export function getUsers() {
    return knex.select('username')
        .from('users')
        .where({ active: true });
};

// Get user info and saldo in each group
export function getUser(username: string) {
    return knex
        .from('users')
        .join('user_saldos', { 'user_saldos.user_id': 'users.id' })
        .join('groups', { 'groups.id': 'user_saldos.group_id' })
        .select('users.username', 'groups.name', 'user_saldos.saldo')
        .where({ 'users.username': username, 'users.active': true })
        .then((results) => _.isEmpty(results) ?
            Promise.reject('User not found') :
            Promise.resolve(results)
        );
};

// Create new user
export function createUser(user: IUser) {
    return knex('users').where({username: user.username})
        .then((records) => _.isEmpty(records) ?
            Promise.resolve() :
            Promise.reject(`Username ${user.username} already exists`)
        )
        .then(() => {
            // Hash password
            let hash = bcrypt.hashSync(user.password, saltRounds);
            return knex('users').insert({username: user.username, password: hash})
            .then(() => Promise.resolve());
        });
};

// Puts user's "active" -status to true
export function deleteUser(username: string) {
    return knex('users').where({ username }).update({ active: false })
        .then(() => Promise.resolve());
}

// Compare raw password with the hashed one
export function authenticateUser(user: IUser) {
    return userExists(user.username)
    .then((row) => bcrypt.compareSync(user.password, row.password) ?
        Promise.resolve() :
        Promise.reject('Invalid password'),
    );
};

// Checks if user is in database
export function userExists(username: string) {
    return knex('users').where({ username }).first()
        .then((row) => _.isUndefined(row) ?
            Promise.reject(`User ${username} not found`) :
            Promise.resolve(row)
        );
};
