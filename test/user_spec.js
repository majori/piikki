const expect    = require('chai').expect;
const assert    = require('chai').assert;
const Promise   = require('bluebird');
const _         = require('lodash');
const path      = require('path');

const cfg   = require('../config');
const helper = require('./helpers');

const transactionCore   = require(path.join(cfg.buildDir, 'core/transaction-core'));
const userCore          = require(path.join(cfg.buildDir, 'core/user-core'));
const groupCore         = require(path.join(cfg.buildDir, 'core/group-core'));

describe('Users, groups & transactions', () => {

    const USER = helper.user;
    const GROUP = helper.group;

    before(helper.clearDb);

    it('create a new group', () =>
        expect(
            groupCore.createGroup(GROUP.name)
            .then(() => groupCore.groupExists(GROUP.name))
        ).to.eventually.containSubset(GROUP)
    );

    it('not create a group with existing name', () =>
        expect(groupCore.createGroup(GROUP.name)).to.eventually.be.rejected
    );

    it('create a new user', () =>
        expect(
            userCore.createUser(_.pick(USER, ['username', 'password']))
            .then(() => userCore.userExists(USER.username))
        ).eventually.to.containSubset(_.pick(USER, ['username']))
    );

    it('not create a user with existing name', () =>
        expect(
            userCore.createUser(_.pick(USER, ['username', 'password']))
        ).eventually.to.be.rejected
    );

    it('authenticate user', () =>
        expect(userCore.authenticateUser(USER)).to.eventually.equal(true)
    );

    it('not authenticate user with wrong password', () => 
        expect(
            userCore.authenticateUser(_.assign(USER, { password: 'wrong' }))
        ).to.eventually.equal(false)
    );

    it('create saldo for user', () =>
        expect(groupCore.addUserToGroup(USER.username, GROUP.name)).to.eventually.be.fulfilled
    );

    it('make a transaction', () => {
        let amount = 10;

        return transactionCore.makeTransaction(USER.username, GROUP.name, amount)
        .then((res) => {
            expect(res).to.have.property('username', USER.username);
            expect(res).to.have.property('saldo', amount);
            return expect(userCore.getUser(USER.username))
                .to.eventually.containSubset({ saldos: { [GROUP.name]: amount } });
        })
        .then(() => transactionCore.makeTransaction(USER.username, GROUP.name, -amount))
        .then((res) => {
            expect(res).to.have.property('username', USER.username);
            expect(res).to.have.property('saldo', 0);
            return expect(userCore.getUser(USER.username))
                .to.eventually.containSubset({ saldos: { [GROUP.name]: 0 } });
        });
    });
});
