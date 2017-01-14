const chai      = require('chai');
const expect    = chai.expect;
const assert    = chai.assert;
const request   = chai.request;
const path      = require('path');
const Promise   = require('bluebird');
const _         = require('lodash');

const cfg   = require('../config');
const helper = require('./helpers');

const UNAUTHORIZED = 401;
const BAD_REQUEST = 400;

const app = require(path.join(cfg.buildDir, 'app'));

function expectOk(err, res) {
    expect(err).to.be.null;
    expect(res).to.be.json;
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('ok', true);
    expect(res.body).to.have.property('result');
}

function expectError(err, res) {
    expect(err).not.to.be.null;
    expect(res).to.be.json;
    expect(res.body).to.have.property('ok', false);
    expect(res.body).to.have.property('message');
}

describe('API', () => {

    const USER = helper.user;
    const USER_2 = { username: 'otherUser', password: 'hackme' };
    const GROUP = helper.group;
    let HEADERS;
    let API;

    // Clear tables and migrate to latest
    before((done) => {
        helper.clearDb()
        .then(helper.initializeUserAndGroup)
        .then(helper.createGroupToken)
        .then((token) => {
            HEADERS = { Authorization: token };
            API = app.createApp(cfg);
            done();
        })
    });

    describe('Routes', () => {

        it('get users [GET /users]', (done) => {
            request(API)
            .get('/api/users')
            .set(HEADERS)
            .end((err, res) => {
                expectOk(err, res);
                expect(res.body.result).to.have.length(1);
                expect(_.first(res.body.result)).to.have.property('username', USER.username);
                done();
            })
        });

        it('create new user [POST /users/create]', (done) => {
            request(API)
            .post('/api/users/create')
            .set(HEADERS)
            .send(USER_2)
            .end((err, res) => {
                expectOk(err, res);
                done();
            });
        });

        it('delete user (mark it as non-active) [DELETE /users]', (done) => {

            Promise.resolve()
            .then(() => {
                request(API)
                .get('/api/users')
                .set(HEADERS)
                .end((err, res) => {
                    expectOk(err, res);
                    expect(res.body.result).to.include(_.pick(USER_2, 'username'));
                    return Promise.resolve();
                })
            })
            .then(() => {
                request(API)
                .del('/api/users')
                .set(HEADERS)
                .send(USER_2)
                .end((err, res) => {
                    expectOk(err, res);
                    return Promise.resolve();
                })
            })
            .then(() => {
                request(API)
                .get('/api/users')
                .set(HEADERS)
                .end((err, res) => {
                    expectOk(err, res);
                    expect(res.body.result).not.to.include(_.pick(USER_2, 'username'));
                    done();
                })
            })
        });

        it('authenticate user [POST /users/authenticate]', (done) => {
            Promise.resolve()

            // With right password
            .then(() => {
                request(API)
                .post('/api/users/authenticate')
                .set(HEADERS)
                .send(USER)
                .end((err, res) => {
                    expectOk(err, res);
                    expect(res.body.result.authenticated).to.be.true;
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
                    expectOk(err, res);
                    expect(res.body.result.authenticated).to.be.false;
                    done();
                });
            });
        });

        it('get all users (if client uses generic token)');

        it('create group (if client uses generic token)');
    });

    describe('Errors', () => {
        it('unauthorize client without token', (done) => {
            Promise.each(helper.routes, (route) => {
                request(API)
                    [route.method](route.route)
                    .end((err, res) => {
                        expectError(err, res);
                        expect(res).to.have.status(UNAUTHORIZED);
                        return Promise.resolve();
                    });
            })
            .then(() => done());
        });

        it('tell about bad username', (done) => {
            Promise.each(['/api/users/authenticate'], (route) => {
                const badUsername = 'bad_username';

                request(API)
                .post(route)
                .set(HEADERS)
                .send(_.assign(USER, { username: badUsername }))
                .end((err, res) => {
                    expectError(err, res);
                    expect(res).to.have.status(BAD_REQUEST);
                    expect(res.body.message).to.equal(`Bad Request: User ${badUsername} not found`);
                });
            })
            .then(() => done());
        });
    });
});
