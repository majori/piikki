/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should, request } from 'chai';
import * as _ from 'lodash';
import { Express } from 'express';

import * as helper from './helpers';
const cfg = require('../config');

import { createApp } from '../src/app';

const UNAUTHORIZED = 401;
const BAD_REQUEST = 400;

function expectOk(err: any, res: ChaiHttp.Response) {
  expect(err).to.be.null;
  expect(res).to.be.json;
  expect(res).to.have.status(200);
  expect(res.body).to.have.property('ok', true);
  expect(res.body).to.have.property('result');
}

function expectError(err: any, res: ChaiHttp.Response) {
  expect(err).not.to.be.null;
  expect(res).to.be.json;
  expect(res.body).to.have.property('ok', false);
  expect(res.body).to.have.property('message');
}

describe('API', () => {

  const USER = helper.user;
  const USER_2 = { username: 'otherUser', password: 'hackme' };
  const GROUP = helper.group;
  const GLOBAL_TOKEN = helper.globalToken;
  const RESTRICTED_TOKEN = helper.restrictedToken;

  let HEADERS;
  let API: Express;

  // Clear tables and migrate to latest
  before(async () => {
      await helper.clearDbAndRunSeed();
      API = await createApp(cfg);
  });

  describe('Restricted', () => {

    const PREFIX = '/api/v1/restricted';

    before((done) => {
      HEADERS = { Authorization: RESTRICTED_TOKEN };
      done();
    });

    it('create new user [POST /users/create]', (done) => {
      request(API)
      .post(`${PREFIX}/users/create`)
      .set('Authorization', RESTRICTED_TOKEN)
      .send(USER_2)
      .end((err: any, res) => {
        expectOk(err, res);
        done();
      });
    });

    it('authenticate user [POST /users/authenticate]', (done) => {
      Promise.resolve()

      // With right password
      .then(() => {
        request(API)
        .post(`${PREFIX}/users/authenticate`)
        .set('Authorization', RESTRICTED_TOKEN)
        .send(USER)
        .end((err: any, res) => {
            expectOk(err, res);
            expect(res.body.result.authenticated).to.be.true;
            return Promise.resolve();
        });
      })

      // With wrong password
      .then(() => {
        request(API)
        .post(`${PREFIX}/users/authenticate`)
        .set('Authorization', RESTRICTED_TOKEN)
        .send(_.assign(USER, { password: 'wrong_password' }))
        .end((err: any, res) => {
          expectOk(err, res);
          expect(res.body.result.authenticated).to.be.false;
          done();
        });
      });
    });
  });

  describe('Global', () => {
    it('create group');
  });

  describe('Errors', () => {
    it('bad authentication', (done) => {
      request(API)
      .post('/api/v1/global/users/authenticate')
      .set('Authorization', GLOBAL_TOKEN)
      .send(_.assign(USER, { username: 'bad_username' }))
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result.authenticated).to.equal(false);
        done();
      });
    });
  });
});
