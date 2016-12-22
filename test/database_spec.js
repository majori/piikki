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

const tables = ['transactions', 'user_saldos', 'groups', 'users', 'knex_migrations'];

describe('Database', () => {

    const user = { username: 'testuser', password: '1234', saldo: 0 };
    const group = { name: 'testGroup' };

    // Clear tables and migrate to latest
    before(() => Promise.each(tables, table =>
            knex.schema.dropTableIfExists(table)
        )
        .then(() => knex.migrate.latest({directory: cfg.migrationDir}))
    );

    it('should create a new group', () =>
        expect(
            groupCore.createGroup(group.name)
            .then(() => groupCore.groupExists(group.name))
        ).to.eventually.containSubset(group)
    );

    it('should not create a group with existing name', () =>
        expect(groupCore.createGroup(group.name)).to.eventually.be.rejected
    );

    it('should create a new user', () =>
        expect(
            userCore.createUser(_.pick(user, ['username', 'password']))
            .then(() => userCore.userExists(user.username))
        ).eventually.to.containSubset(_.pick(user, ['username']))
    );

    it('should not create a user with existing name', () =>
        expect(
            userCore.createUser(_.pick(user, ['username', 'password']))
        ).eventually.to.be.rejected
    );

    it('should authenticate user', () =>
        expect(userCore.authenticateUser(user)).to.eventually.be.fulfilled
    );

    it('should not authenticate user with wrong password', () => 
        expect(
            userCore.authenticateUser(_.assign(user, { password: 'wrong' }))
        ).to.eventually.be.rejectedWith('Invalid password')
    );

    it('should create saldo for user', () =>
        expect(userCore.createSaldoForUser(user.username, group.name)).to.eventually.be.fulfilled
    );

    it('should make a transaction', () => {
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
});
