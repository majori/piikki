/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should, request } from 'chai';
import * as _ from 'lodash';
import { Express } from 'express';

import { IConfig } from '../src/models/config';
import * as seed from '../seeds/data/test';
import * as helper from './helpers';

const cfg: IConfig = require('../config'); // tslint:disable-line

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

  const USER = _.clone(helper.user);
  const USER_2 = { username: 'otherUser', password: 'hackme' };
  const GROUP = _.clone(helper.group);

  const ADMIN_TOKEN = helper.adminToken;
  const GLOBAL_TOKEN = helper.globalToken;
  const RESTRICTED_TOKEN = helper.restrictedToken;

  const PREFIX = '/api/v1';
  let API: ChaiHttp.Agent;

  // Clear tables and migrate to latest
  before(async () => {
      await helper.clearDbAndRunSeed();
      API = request(await createApp(cfg));
  });

  describe('Restricted', () => {

    it('create new user [POST /users/create]', (done) => {
      API
      .post(`${PREFIX}/restricted/users/create`)
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
        API
        .post(`${PREFIX}/restricted/users/authenticate`)
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
        API
        .post(`${PREFIX}/restricted/users/authenticate`)
        .set('Authorization', RESTRICTED_TOKEN)
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
        .post(`${PREFIX}/restricted/users/authenticate`)
        .set('Authorization', RESTRICTED_TOKEN)
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
      .post(`${PREFIX}/restricted/group/members/${USER.username}/authenticate/create`)
      .set('Authorization', RESTRICTED_TOKEN)
      .send({ key })
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
        .post(`${PREFIX}/restricted/group/members/${USER.username}/authenticate`)
        .set('Authorization', RESTRICTED_TOKEN)
        .send({ key: right_key })
        .end((err: any, res) => {
          expectOk(err, res);
          expect(res.body.result.authenticated).to.equal(true);
          resolve();
        });
      })

      // Right username with wrong key
      .then(() => new Promise((resolve, reject) => {
        API
        .post(`${PREFIX}/restricted/group/members/${USER.username}/authenticate`)
        .set('Authorization', RESTRICTED_TOKEN)
        .send({ key: 'wrong_key' })
        .end((err: any, res) => {
          expectOk(err, res);
          expect(res.body.result.authenticated).to.equal(false);
          resolve();
        });
      }))

      // Wrong username with right key
      .then(() => {
        API
        .post(`${PREFIX}/restricted/group/members/wrong_user/authenticate`)
        .set('Authorization', RESTRICTED_TOKEN)
        .send({ key: right_key })
        .end((err: any, res) => {
          expectOk(err, res);
          expect(res.body.result.authenticated).to.equal(false);
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

  describe('Global', () => {
    it('get users');
    it('get user');
    it('delete user');
    it('authenticate user');
    it('create alternative login for user');
    it('authenticate with alternative login');
    it('reset password');
    it('reset username');
    it('get groups');
    it('get group members');
    it('get group member');
    it('create group');
    it('add member to group');
    it('remove member from group');
    it('make transaction');
    it('get group transactions');
    it('get user transactions');
    it('get group saldo');
    it('get daily group saldo since');
  });

  describe('Admin', () => {
    it('create a restricted token', (done) => {
      API
      .post(`${PREFIX}/admin/tokens/restricted`)
      .set('Authorization', ADMIN_TOKEN)
      .send({ groupName: GROUP.groupName, comment: 'Test token'})
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result).to.be.string;
        done();
      });
    });

    it('create a global token', (done) => {
      API
      .post(`${PREFIX}/admin/tokens/global`)
      .set('Authorization', ADMIN_TOKEN)
      .send({ comment: 'Test token' })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result).to.be.string;
        done();
      });
    });

    it('create a admin token', (done) => {
      API
      .post(`${PREFIX}/admin/tokens/admin`)
      .set('Authorization', ADMIN_TOKEN)
      .send({ comment: 'Test token' })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result).to.be.string;
        done();
      });
    });

    it('get tokens', (done) => {
      API
      .get(`${PREFIX}/admin/tokens`)
      .set('Authorization', ADMIN_TOKEN)
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result).to.have.length(seed.tokens.length + 3);
        done();
      });
    });

    it('delete token', (done) => {
      Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          API
          .get(`${PREFIX}/admin/tokens`)
          .set('Authorization', ADMIN_TOKEN)
          .end((err: any, res) => {
            expectOk(err, res);
            const token: any = _.last(res.body.result);

            resolve(token.token);
          });
        });
      })

      .then((token) => {
        return new Promise((resolve, reject) => {
          API
          .del(`${PREFIX}/admin/tokens`)
          .set('Authorization', ADMIN_TOKEN)
          .send({ token })
          .end((err: any, res) => {
            expectOk(err, res);
            resolve();
          });
        });
      })

      .then(() => {
        API
        .get(`${PREFIX}/admin/tokens`)
        .set('Authorization', ADMIN_TOKEN)
        .end((err: any, res) => {
          expectOk(err, res);
          expect(res.body.result).to.have.length(seed.tokens.length + 2);
          done();
        });
      });
    });

    it('force reset password');
  });
});
