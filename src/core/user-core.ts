import * as bcrypt from 'bcrypt';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

import { knex } from '../database';
import { IUser, saltRounds } from './core-utils';

export function getUsers() {
    return knex.select('username', 'saldo')
            .from('users')
            .where({ deleted: false });
};

export function getUser(username: string) {
    return knex.select('username', 'saldo')
            .from('users')
            .where({ username, deleted: false })
            .first();
};

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
            Promise.reject('User not found') :
            Promise.resolve(row)
        );
};
