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

const app = require(path.join(cfg.buildDir, 'app'));

describe('API', () => {

    const USER = helper.user;
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

        it('delete user (mark it as non-active)');

        it('get all users (if client uses generic token)');

        it('create group (if client uses generic token)');
    });

    describe('Errors', () => {
        it('unauthorize client without token', (done) => {
            Promise.each(helper.routes, (route) => {
                request(API)
                    [route.method](route.route)
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(err).to.have.status(UNAUTHORIZED);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('message');
                        expect(res.body).to.have.property('ok', false);
                        return Promise.resolve();
                    });
            })
            .then(() => done());
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
        });
    });
});
