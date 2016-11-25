import * as knex from 'knex';
import * as bcrypt from 'bcrypt';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

const cfg = require('../config.js');
const saltRounds = 10;
const db = knex(cfg.db);

interface User {
    username: string;
    password?: string;
};

export function getUsers(): knex.QueryBuilder {
    return db.select('id', 'username', 'saldo').from('users');
}

export function getUser(user: User): Promise<any> {
    return validateUser(user)
        .then(() => db.select('id', 'username', 'saldo').from('users').where({username: user.username}).first());
}

export function createUser(user: User): Promise<any> {
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

export function authenticateUser(user: User): Promise<any> {
    return validateUser(user)
        .then(() => db('users')
            .where({ username: user.username })
            .first('password')
        )
        .then(row => bcrypt.compareSync(user.password, row.password) ?
            Promise.resolve() :
            Promise.reject('Invalid password')
        );
};

export function makeTransaction(user: User, amount: number, comment?: string): Promise<any> {
    return validateUser(user)
        .then(() => _.isNumber(amount) ? Promise.resolve() : Promise.reject('Amount is not a number'))
        .then(() => userExists(user))
        .then((fetchedUser) => db.transaction(trx =>
            trx.table('users')
            .where({username: fetchedUser.username})
            .update({saldo: fetchedUser.saldo + amount})
            .then(() => Promise.resolve({userId: fetchedUser.id, oldSaldo: fetchedUser.saldo, newSaldo: fetchedUser.saldo + amount}))
            .then(transaction =>
                trx.table('transactions')
                .insert(_.isString(comment) ? _.assign(transaction, { comment }) : transaction ))
            .then(trx.commit)
            .catch(trx.rollback)
        ));
};

export const _knex = db;

// Check if user object is valid
function validateUser(user: User): Promise<string | void> {
    if (_.isUndefined(user.username))   return Promise.reject('No username');
    if (!_.isString(user.username))     return Promise.reject('Username was not a string');
    if (_.isEmpty(user.username))       return Promise.reject('Username was empty');
    if (user.username.length > 20)      return Promise.reject('Username was longer than 20 characters');

    if (!_.isUndefined(user.password)) {
        if (!_.isString(user.password))     return Promise.reject('Password was not a string');
        if (_.isEmpty(user.password))       return Promise.reject('Password was empty');
    }

    return Promise.resolve();
}

// Checks if user is in database
function userExists(user: User) {
    return db('users').where({username: user.username}).first()
        .then(row => _.isUndefined(row) ? Promise.reject('User not found') : Promise.resolve(row));
}
