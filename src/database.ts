import * as bcrypt from 'bcrypt';
import * as Promise from 'bluebird';
import * as knex from 'knex';
import * as _ from 'lodash';

const cfg = require('../config.js');
const saltRounds = 10;

export const _knex = knex(cfg.db);

interface IUser {
    username: string;
    password?: string;
};

export function getUsers(): Promise<any> {
    return Promise.resolve()
        .then(() => _knex.select('id', 'username', 'saldo').from('users').where({ deleted: false }));
};

export function getUser(username: string): Promise<any> {
    return validateUsername(username)
        .then(() => _knex.select('username', 'saldo')
            .from('users')
            .where({ username, deleted: false })
            .first());
};

export function createUser(user: IUser): Promise<any> {
    return validateUser(user)
        .then(() => _knex('users').where({username: user.username}))
        .then((records) => _.isEmpty(records) ?
            Promise.resolve() :
            Promise.reject(`Username ${user.username} already exists`)
        )
        .then(() => {
            // Hash password
            let hash = bcrypt.hashSync(user.password, saltRounds);
            return _knex('users').insert({username: user.username, password: hash});
        });
};

export function authenticateUser(user: IUser): Promise<any> {
    return validateUser(user)
        .then(() => _knex('users')
            .where({ username: user.username })
            .first('password')
        )
        .then((row) => bcrypt.compareSync(user.password, row.password) ?
            Promise.resolve() :
            Promise.reject('Invalid password')
        );
};

export function makeTransaction(username: string, amount: number, comment?: string): Promise<any> {
    return validateUsername(username)
        .then(() => _.isNumber(amount) ? Promise.resolve() : Promise.reject('Amount is not a number'))
        .then(() => userExists(username))
        .then((fetchedUser) => _knex.transaction((trx) =>
            trx.table('users')
            .where({username: fetchedUser.username})
            .update({saldo: fetchedUser.saldo + amount})
            .then(() => Promise.resolve({
                newSaldo: fetchedUser.saldo + amount,
                oldSaldo: fetchedUser.saldo,
                userId: fetchedUser.id,
            }))
            .then((transaction) =>
                trx.table('transactions')
                .insert(_.isString(comment) ? _.assign(transaction, { comment }) : transaction ))
            .then(trx.commit)
            .catch(trx.rollback)
        ));
};


function validateUser(user: IUser): Promise<[string | void]> {
    if (_.isObject(user) && user.username && user.password) {
        return Promise.all([
            validateUsername(user.username),
            validatePassword(user.password),
        ]);
    } else {
        return Promise.reject('Invalid user object');
    }
};

// Check if username is valid
function validateUsername(username: string): Promise<string | void> {

    if (!username)               { return Promise.reject('No username'); };
    if (!_.isString(username))   { return Promise.reject('Username was not a string'); };
    if (_.isEmpty(username))     { return Promise.reject('Username was empty'); };
    if (username.length > 20)    { return Promise.reject('Username was longer than 20 characters'); };

    return Promise.resolve();
};

function validatePassword(password: string): Promise<string | void> {

    if (!_.isString(password)) { return Promise.reject('Password was not a string'); };
    if (_.isEmpty(password)) { return Promise.reject('Password was empty'); };

    return Promise.resolve();
};

function validateUserId(id: string): Promise<string | void> {
    return _.isString(id) ? Promise.resolve() : Promise.reject('User ID was not a string');
};

// Checks if user is in database
function userExists(username: string): Promise<any> {
    return Promise.resolve()
        .then(() => _knex('users').where({ username }).first()
            .then((row) => _.isUndefined(row) ? Promise.reject('User not found') : Promise.resolve(row))
        );
};
