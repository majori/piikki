/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should, request } from 'chai';
import * as _ from 'lodash';
import { Express } from 'express';

import { IConfig } from '../src/models/config';
import * as seed from '../seeds/data/test';
import * as helper from './helpers';
import { expectOk, expectError } from './helpers';

const cfg: IConfig = require('../config'); // tslint:disable-line

import { createApp } from '../src/app';

const USER = _.clone(helper.user);
const GROUP = _.clone(helper.group);

const PREFIX = '/api/v1/admin';
let API: ChaiHttp.Agent;

describe('Admin API', () => {

  before(async () => {
    await helper.clearDbAndRunSeed();
    API = request(await createApp(cfg));
  });

  it('create a restricted token', (done) => {
    API
    .post(`${PREFIX}/tokens/restricted`)
    .set('Authorization', helper.adminToken)
    .send({ groupName: GROUP.groupName, comment: 'Test token'})
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result).to.be.string;
      done();
    });
  });

  it('create a global token', (done) => {
    API
    .post(`${PREFIX}/tokens/global`)
    .set('Authorization', helper.adminToken)
    .send({ comment: 'Test token' })
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result).to.be.string;
      done();
    });
  });

  it('create a admin token', (done) => {
    API
    .post(`${PREFIX}/tokens/admin`)
    .set('Authorization', helper.adminToken)
    .send({ comment: 'Test token' })
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result).to.be.string;
      done();
    });
  });

  it('get tokens', (done) => {
    API
    .get(`${PREFIX}/tokens`)
    .set('Authorization', helper.adminToken)
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result).to.have.length(seed.tokens.length + 3);
      done();
    });
  });

  it('delete token', (done) => {

    // Get one token
    new Promise((resolve, reject) => {
      API
      .get(`${PREFIX}/tokens`)
      .set('Authorization', helper.adminToken)
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result).to.have.length(seed.tokens.length + 3);
        const token: any = _.last(res.body.result);
        resolve(token.token);
      });
    })

    // Delete the token
    .then((token) => {
      return new Promise((resolve, reject) => {
        API
        .del(`${PREFIX}/tokens`)
        .set('Authorization', helper.adminToken)
        .send({ token })
        .end((err: any, res) => {
          expectOk(err, res);
          resolve();
        });
      });
    })

    // Check that the token does not exist anymore
    .then(() => {
      API
      .get(`${PREFIX}/tokens`)
      .set('Authorization', helper.adminToken)
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result).to.have.length(seed.tokens.length + 2);
        done();
      });
    });
  });

  it('force reset password', (done) => {
    const newPassword = 'something_completely_new';

    // Test with old password
    new Promise((resolve, reject) => {
      API
      .post('/api/v1/restricted/users/authenticate')
      .set('Authorization', helper.restrictedToken)
      .send({ username: USER.username, password: USER.password })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result.authenticated).to.be.true;
        done();
      });
    })

    // Do the force-reset
    .then(() => {
      return new Promise((resolve, reject) => {
        API
        .put(`${PREFIX}/users/force-reset/password`)
        .set('Authorization', helper.adminToken)
        .send({ username: USER.username, newPassword })
        .end((err: any, res) => {
          expectOk(err, res);
          resolve();
        });
      });
    })

    // Try to authenticate with the new password
    .then(() => {
      API
      .post('/api/v1/restricted/users/authenticate')
      .set('Authorization', helper.restrictedToken)
      .send({ username: USER.username, password: newPassword })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result.authenticated).to.be.true;
        done();
      });
    })
  });
});
