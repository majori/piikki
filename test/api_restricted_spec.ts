/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should, request } from 'chai';
import * as _ from 'lodash';
import { Express } from 'express';

import { Config } from '../src/models/config';
import * as seed from '../seeds/data/test';
import * as helper from './helpers';
import { expectOk, expectError } from './helpers';

const cfg: Config = require('../config'); // tslint:disable-line

import { createApp } from '../src/app';

const USER = _.clone(helper.user);
const GROUP = _.clone(helper.group);

const PREFIX = '/api/v1/restricted';
let API: ChaiHttp.Agent;

describe('Restricted API', () => {

  before(async () => {
    await helper.clearDbAndRunSeed();
    API = request(await createApp(cfg));
  });

  it('create new user [POST /users/create]', (done) => {
    API
    .post(`${PREFIX}/users/create`)
    .set('Authorization', helper.restrictedToken)
    .send({ username: 'otherUser', password: 'hackme' })
    .end((err: any, res) => {
      expectOk(err, res);
      done();
    });
  });

  it('authenticate user [POST /users/authenticate]', (done) => {
    Promise.resolve()

    // With right password
    .then(() => {
      API
      .post(`${PREFIX}/users/authenticate`)
      .set('Authorization', helper.restrictedToken)
      .send(USER)
      .end((err: any, res) => {
          expectOk(err, res);
          expect(res.body.result.authenticated).to.be.true;
          return Promise.resolve();
      });
    })

    // With wrong password
    .then(() => {
      API
      .post(`${PREFIX}/users/authenticate`)
      .set('Authorization', helper.restrictedToken)
      .send({ username: USER.username, password: 'wrong_password' })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result.authenticated).to.be.false;
        return Promise.resolve();
      });
    })

    // With wrong username
    .then(() => {
      API
      .post(`${PREFIX}/users/authenticate`)
      .set('Authorization', helper.restrictedToken)
      .send({ username: 'wrong_username', password: USER.password })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result.authenticated).to.be.false;
        done();
      });
    });
  });

  it('create alternative login [POST /group/members/:username/authenticate/create]', (done) => {
    const key = 'some_kind_of_id';

    API
    .post(`${PREFIX}/users/authenticate/alternative/create`)
    .set('Authorization', helper.restrictedToken)
    .send({ key, username: USER.username })
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result.key).to.equal(key);
      done();
    });
  });

  it('authenticate with alternative login [POST group/members/:username/authenticate]', (done) => {
    const right_key = 'some_kind_of_id';

    // Right username with right key
    new Promise((resolve, reject) => {
      API
      .post(`${PREFIX}/users/authenticate/alternative`)
      .set('Authorization', helper.restrictedToken)
      .send({ key: right_key })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result.authenticated).to.be.true;
        resolve();
      });
    })

    // Right username with wrong key
    .then(() => new Promise((resolve, reject) => {
      API
      .post(`${PREFIX}/users/authenticate/alternative`)
      .set('Authorization', helper.restrictedToken)
      .send({ key: 'wrong_key' })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result.authenticated).to.be.false;
        resolve();
      });
    }))

    // Wrong username with right type
    .then(() => {
      API
      .post(`${PREFIX}/users/authenticate/alternative`)
      .set('Authorization', helper.restrictedToken)
      .send({ key: right_key, type: 10 })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result.authenticated).to.be.false;
        done();
      });
    });
  });

  it('reset password');
  it('reset username');
  it('get group members');
  it('get group member');
  it('add member to group');
  it('remove member from group');
  it('make transaction');
  it('get group transactions');
  it('get user transactions from group');
  it('get group saldo');
});

