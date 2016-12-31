const expect    = require('chai').expect;
const assert    = require('chai').assert;
const Promise   = require('bluebird');
const _         = require('lodash');
const path      = require('path');

const cfg   = require('../config');
const knex  = require(path.join(cfg.buildDir, 'database')).knex;

const transactionCore   = require(path.join(cfg.buildDir, 'core/transaction-core'));
const userCore          = require(path.join(cfg.buildDir, 'core/user-core'));
const groupCore         = require(path.join(cfg.buildDir, 'core/group-core'));
const tokenCore         = require(path.join(cfg.buildDir, 'core/token-core'));

const TABLES = ['transactions', 'user_saldos', 'token_group_access', 'users', 'groups', 'tokens', 'knex_migrations'];

describe('Database', () => {

    const user = { username: 'testuser', password: '1234', saldo: 0 };
    const group = { name: 'testGroup' };

    // Clear tables and migrate to latest
    before(() => Promise
        .each(TABLES, table => knex.schema.dropTableIfExists(table))
        .then(() => knex.migrate.latest({directory: cfg.migrationDir}))
    );

    it('create a new group', () =>
        expect(
            groupCore.createGroup(group.name)
            .then(() => groupCore.groupExists(group.name))
        ).to.eventually.containSubset(group)
    );

    it('not create a group with existing name', () =>
        expect(groupCore.createGroup(group.name)).to.eventually.be.rejected
    );

    it('create a new user', () =>
        expect(
            userCore.createUser(_.pick(user, ['username', 'password']))
            .then(() => userCore.userExists(user.username))
        ).eventually.to.containSubset(_.pick(user, ['username']))
    );

    it('not create a user with existing name', () =>
        expect(
            userCore.createUser(_.pick(user, ['username', 'password']))
        ).eventually.to.be.rejected
    );

    it('authenticate user', () =>
        expect(userCore.authenticateUser(user)).to.eventually.be.fulfilled
    );

    it('not authenticate user with wrong password', () => 
        expect(
            userCore.authenticateUser(_.assign(user, { password: 'wrong' }))
        ).to.eventually.be.rejectedWith('Invalid password')
    );

    it('create saldo for user', () =>
        expect(userCore.createSaldoForUser(user.username, group.name)).to.eventually.be.fulfilled
    );

    it('make a transaction', () => {
        let amount = 10;

        return transactionCore.makeTransaction(user.username, group.name, amount)
        .then((res) => {
            expect(res).to.have.property('username', user.username);
            expect(res).to.have.property('saldo', amount);
            return expect(userCore.getUser(user.username))
                .to.eventually.containSubset({ saldos: { [group.name]: amount } });
        })
        .then(() => transactionCore.makeTransaction(user.username, group.name, -amount))
        .then((res) => {
            expect(res).to.have.property('username', user.username);
            expect(res).to.have.property('saldo', 0);
            return expect(userCore.getUser(user.username))
                .to.eventually.containSubset({ saldos: { [group.name]: 0 } });
        });
    });

    it('create token', () => {
        return tokenCore.createGroupToken(group.name, 'basic')
        .then((res) => {
            expect(res).to.be.string;
            return Promise.resolve();
        })
        .then(() => tokenCore.createGroupToken(group.name, 'supervisor', 'Organization A'))
        .then((res) => {
            expect(res).to.be.string;
            return Promise.resolve();
        })
        .then(() => tokenCore.createGenericToken('Generic client'))
        .then((res) => {
            expect(res).to.be.string;
            return Promise.resolve();
        });
    });

    it('get tokens', () => {
        return tokenCore.getTokens()
        .then((tokens) => {
            expect(tokens).to.be.an.array;
            expect(tokens).to.have.length(3);

            expect(tokens[0]).to.have.property('token');
            expect(tokens[0]).to.have.property('role', 'basic');
            expect(tokens[0]).to.have.property('group_name', group.name);

            expect(tokens[1]).to.have.property('token');
            expect(tokens[1]).to.have.property('role', 'supervisor');
            expect(tokens[1]).to.have.property('group_name', group.name);

            expect(tokens[2]).to.have.property('token');
            expect(tokens[2]).to.have.property('role', 'generic');
            expect(tokens[2]).to.have.property('group_name', null);
        });
    });
});
