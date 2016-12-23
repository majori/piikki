const chai      = require('chai');
const expect    = chai.expect;
const assert    = chai.assert;
const request   = chai.request;
const path      = require('path');
const Promise   = require('bluebird');
const _         = require('lodash');

const cfg   = require('../config');
const knex  = require(path.join(cfg.buildDir, 'database')).knex;

const UNAUTHORIZED = 401;
const USER = { username: 'test', password: 'hackme' };
const HEADERS = { Authorization: 'opensesame' };
const DB_TABLES = ['transactions', 'user_saldos', 'groups', 'users', 'knex_migrations'];

const app = require(path.join(cfg.buildDir, 'app'));

describe('API', () => {

    // Clear tables and migrate to latest
    before(() => Promise.each(DB_TABLES, table =>
            knex.schema.dropTableIfExists(table)
        )
        .then(() => knex.migrate.latest({directory: cfg.migrationDir}))
    );

    const api = app.createApp(cfg);

    it('should unauthorize client without token', (done) => {
        request(api)
            .get('/api/users')
            .end((err, res) => {
                expect(err).not.to.be.undefined;
                expect(err).to.have.status(UNAUTHORIZED);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('ok', false);
                done();
            });
    });

    it('should create new user [/users/create]', (done) => {
        request(api)
            .post('/api/users/create')
            .set(HEADERS)
            .send(USER)
            .end((err, res) => {
                expect(res).to.be.json;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('should authenticate user [/users/authenticate]', () => {
        return Promise.resolve()
        .then(() => {
            request(api)
            .post('/api/users/authenticate')
            .set(HEADERS)
            .send(USER)
            .end((err, res) => {
                expect(res).to.be.json;
                expect(res).to.have.status(200);
                return Promise.resolve();
            });
        })
        .then(() => {
            request(api)
            .post('/api/users/authenticate')
            .set(HEADERS)
            .send(_.assign(USER, { password: 'wrong_password' }))
            .end((err, res) => {
                expect(res).to.be.json;
                expect(res.body).to.have.property('ok', false);
                expect(res.body).to.have.property('message', 'Bad Request: Invalid password');
                expect(res).to.have.status(400);
                return Promise.resolve();
            });
        });
    });

    it('should tell about bad username', () => {
        return Promise.each(['/api/users/authenticate'], (route) => {
            let badUsername = 'bad_username';

            request(api)
            .post(route)
            .set(HEADERS)
            .send(_.assign(USER, { username: badUsername }))
            .end((err, res) => {
                expect(res).to.be.json;
                expect(res.body).to.have.property('ok', false);
                expect(res.body).to.have.property('message', `Bad Request: User ${badUsername} not found`);
                expect(res).to.have.status(400);
                return Promise.resolve();
            });
        })
    })

});
