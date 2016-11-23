import * as knex from 'knex';
import * as bcrypt from 'bcrypt';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

const cfg = require('../config.js');
const saltRounds = 10;
const db = knex(cfg.db);

interface User {
    username: string;
    password: string;
};

export function saveUser(user: User): Promise<any> {
    return validateUser(user)
        .then(() => db('users').where({username: user.username}))
        .then(records => _.isEmpty(records) ?
            Promise.resolve() :
            Promise.reject(`Username ${user.username} already exists`)
        )
        .then(() => {
            // Hash password
            let hash = bcrypt.hashSync(user.password, saltRounds);
            return db('users').insert({username: user.username, password: hash});
        });
};

export function authorizeUser(user: User): Promise<any> {
    return validateUser(user)
        .then(() => db('users')
            .where({ username: user.username })
            .first('password')
        )
        .then(record => bcrypt.compareSync(user.password, record.password) ?
            Promise.resolve() :
            Promise.reject('Invalid password')
        );
};

function validateUser(user: User): Promise<string | void> {
    if (_.isUndefined(user.username))   return Promise.reject('No username');
    if (!_.isString(user.username))     return Promise.reject('Username was not a string');
    if (_.isEmpty(user.username))       return Promise.reject('Username was empty')
    if (user.username.length > 20)      return Promise.reject('Username was longer than 20 characters');

    if (_.isUndefined(user.password))   return Promise.reject('No password');
    if (!_.isString(user.password))     return Promise.reject('Password was not a string');
    if (_.isEmpty(user.password))       return Promise.reject('Password was empty');

    return Promise.resolve();
}
