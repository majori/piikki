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

export default {

    saveUser: (user: User): Promise.Thenable<any> => {

        if (_.isUndefined(user.username))   return Promise.reject('No username');
        if (!_.isString(user.username))     return Promise.reject('Username was not a string');
        if (_.isEmpty(user.username))       return Promise.reject('Username was empty')
        if (user.username.length > 20)      return Promise.reject('Username was longer than 20 characters');

        if (_.isUndefined(user.password))   return Promise.reject('No password');
        if (!_.isString(user.password))     return Promise.reject('Password was not a string');
        if (_.isEmpty(user.password))       return Promise.reject('Password was empty');

        // TODO: Check if username alerady exists

        // Hash password
        let hash = bcrypt.hashSync(user.password, saltRounds);
        return db('users').insert({username: user.username, password: hash});
    },

    saveTransaction: () => {

    }
};

/*
db('users').insert({username: 'test'})
.then(() => {
    console.log('Test insert succesful!');
});
*/