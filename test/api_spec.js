const chai      = require('chai');
const expect    = chai.expect;
const assert    = chai.assert;
const request   = chai.request;
const path      = require('path');
const Promise   = require('bluebird');
const _         = require('lodash');

const cfg   = require('../config');
const knex  = require(path.join(cfg.buildDir, 'database')).knex;

const tokenCore = require(path.join(cfg.buildDir, 'core/token-core'));
const groupCore = require(path.join(cfg.buildDir, 'core/group-core'));
const userCore  = require(path.join(cfg.buildDir, 'core/user-core'));

const UNAUTHORIZED = 401;
const USER = { username: 'test', password: 'hackme' };
const GROUP = { name: 'testGroup' };
const DB_TABLES = ['transactions', 'user_saldos', 'token_group_access', 'users', 'groups', 'tokens', 'knex_migrations'];

const app = require(path.join(cfg.buildDir, 'app'));

describe('API', () => {

    let HEADERS;
    let API;

    // Clear tables and migrate to latest
    before(() => Promise.each(DB_TABLES, table =>
            knex.schema.dropTableIfExists(table)
        )
        .then(() => knex.migrate.latest({directory: cfg.migrationDir}))
        .then(() => groupCore.createGroup(GROUP.name))
        .then(() => userCore.createUser(USER))
        .then(() => userCore.createSaldoForUser(USER.username, GROUP.name))
        .then(() => tokenCore.createGroupToken(GROUP.name, 'basic'))
        .then((token) => {
            HEADERS = { Authorization: token };
            API = app.createApp(cfg);
            return Promise.resolve();
        })
    );

    it('unauthorize client without token', (done) => {
        request(API)
            .get('/api/users')
            .end((err, res) => {
                expect(err).not.to.be.null;
                expect(err).to.have.status(UNAUTHORIZED);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('ok', false);
                done();
            });
    });

    it('create new user [/users/create]', (done) => {
        request(API)
            .post('/api/users/create')
            .set(HEADERS)
            .send({ username: 'otherUser', password: 'hackme' })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.be.json;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('authenticate user [/users/authenticate]', (done) => {
        Promise.resolve()

        // With right password
        .then(() => {
            request(API)
            .post('/api/users/authenticate')
            .set(HEADERS)
            .send(USER)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.be.json;
                expect(res).to.have.status(200);
                return Promise.resolve();
            });
        })

        // With wrong password
        .then(() => {
            request(API)
            .post('/api/users/authenticate')
            .set(HEADERS)
            .send(_.assign(USER, { password: 'wrong_password' }))
            .end((err, res) => {
                expect(err).not.to.be.null;
                expect(res).to.be.json;
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('ok', false);
                expect(res.body).to.have.property('message', 'Bad Request: Invalid password');
                done();
            });
        });
    });

    it('tell about bad username', (done) => {
        Promise.each(['/api/users/authenticate'], (route) => {
            let badUsername = 'bad_username';

            request(API)
            .post(route)
            .set(HEADERS)
            .send(_.assign(USER, { username: badUsername }))
            .end((err, res) => {
                expect(err).not.to.be.null;
                expect(res).to.be.json;
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('ok', false);
                expect(res.body).to.have.property('message', `Bad Request: User ${badUsername} not found`);
            });
        })
        .then(() => done());
    })

});
