const expect    = require('chai').expect;
const assert    = require('chai').assert;
const Promise   = require('bluebird');
const _         = require('lodash');

const cfg = require('../config');
const db = require(`${cfg.buildDir}/database`);

const tables = ['transactions', 'users', 'knex_migrations'];

describe('Database', () => {

    const user = { username: 'testuser', password: '1234', saldo: 0 };

    // Clear tables and migrate to latest
    before(() => Promise.each(tables, table =>
            db._knex.schema.dropTableIfExists(table)
        )
        .then(() => db._knex.migrate.latest({directory: cfg.migrationDir}))
    );

    it('should create a new user', () => expect(
        db.createUser(_.pick(user, ['username', 'password']))
        .then(() => db.getUser(user.username))).eventually.to.containSubset(_.pick(user, ['username', 'saldo']))
    );

    it('should authenticate user', () => 
        expect(db.authenticateUser(user)).to.eventually.be.fulfilled
    );

    it('should not authenticate user with wrong password', () => 
        expect(db.authenticateUser(_.assign(user, { password: 'wrong' }))).to.eventually.be.rejectedWith('Invalid password')
    );

    it('should make a transaction', () => {
        let amount = 10;
        
        return db.makeTransaction(user.username, amount)
        .then(() => expect(db.getUser(user.username)).to.eventually.containSubset({ saldo: amount }))
        .then(() => db.makeTransaction(user.username, -amount))
        .then(() => expect(db.getUser(user.username)).to.eventually.containSubset({ saldo: 0 }));
    });
});
