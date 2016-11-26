const expect    = require('chai').expect;
const assert    = require('chai').assert;
const Promise   = require('bluebird');
const _         = require('lodash');

const cfg = require('../config');
const knex = require(`${cfg.buildDir}/database`).knex;
const transactionCore = require(`${cfg.buildDir}/core/transaction-core`);
const userCore = require(`${cfg.buildDir}/core/user-core`);

const tables = ['transactions', 'users', 'knex_migrations'];

describe('Database', () => {

    const user = { username: 'testuser', password: '1234', saldo: 0 };

    // Clear tables and migrate to latest
    before(() => Promise.each(tables, table =>
            knex.schema.dropTableIfExists(table)
        )
        .then(() => knex.migrate.latest({directory: cfg.migrationDir}))
    );

    it('should create a new user', () => expect(
        userCore.createUser(_.pick(user, ['username', 'password']))
        .then(() => userCore.getUser(user.username))).eventually.to.containSubset(_.pick(user, ['username', 'saldo']))
    );

    it('should authenticate user', () => 
        expect(userCore.authenticateUser(user)).to.eventually.be.fulfilled
    );

    it('should not authenticate user with wrong password', () => 
        expect(userCore.authenticateUser(_.assign(user, { password: 'wrong' }))).to.eventually.be.rejectedWith('Invalid password')
    );

    it('should make a transaction', () => {
        let amount = 10;
        
        return transactionCore.makeTransaction(user.username, amount)
        .then(() => expect(userCore.getUser(user.username)).to.eventually.containSubset({ saldo: amount }))
        .then(() => transactionCore.makeTransaction(user.username, -amount))
        .then(() => expect(userCore.getUser(user.username)).to.eventually.containSubset({ saldo: 0 }));
    });
});
