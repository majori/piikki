import * as bcrypt from 'bcrypt';
import * as Promise from 'bluebird';
import { QueryBuilder } from 'knex';
import * as _ from 'lodash';

import { ConflictError, NotFoundError } from '../errors';
import { knex, IDatabaseUser, IDatabaseGroup } from '../database';
import { groupExists } from './group-core';

export interface IUserDto {
    username: string;
    password?: string;
};

export const SALT_ROUNDS = 6;

// Get all users in group
export function getUsers() {
    return knex
        .select('username')
        .from('users')
        .where({ active: true });
};

// Get user info and saldo in each group
export function getUser(username: string) {
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
                if (_.isEmpty(results)) { return Promise.resolve(user); };

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
    return knex.from('users').where({username: user.username})
        .then((records) => _.isEmpty(records) ?
            Promise.resolve() :
            Promise.reject(new ConflictError(`Username ${user.username} already exists`))
        )
        .then(() => new Promise((resolve, reject) => {
            bcrypt.hash(user.password, SALT_ROUNDS, (err, hash) => (err) ?
                reject(err) :
                resolve(hash));
            })
        )
        .then((hash) => knex.from('users').insert({
            username: user.username,
            password: hash
        }))
        .then(() => Promise.resolve(user.username));
};

// Puts user's "active" -status to false
export function deleteUser(username: string) {
    return knex.from('users').where({ username }).update({ active: false })
        .then(() => Promise.resolve());
}

// Compare raw password with the hashed one
export function authenticateUser(user: IUserDto) {
    return userExists(user.username)
    .then((row: IDatabaseUser) => new Promise((resolve, reject) => {
        bcrypt.compare(user.password, row.password, (err, same) => resolve(same))
    }));
};

// Checks if user is in database
export function userExists(username: string) {
    return knex.from('users').where({ username }).first()
        .then((row: IDatabaseUser) => _.isUndefined(row) ?
            Promise.reject(new NotFoundError(`User ${username} not found`)) :
            Promise.resolve(row)
        );
};
