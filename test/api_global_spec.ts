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

const PREFIX = '/api/v1/global';
let API: ChaiHttp.Agent;

describe('Global API', () => {

  before(async () => {
    await helper.clearDbAndRunSeed();
    API = request(await createApp(cfg));
  });

  it('get users', (done) => {
    API
    .get(`${PREFIX}/users`)
    .set('Authorization', helper.globalToken)
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result).have.length(seed.data.users.length);
      done();
    });
  });

  it('get user', (done) => {
    API
    .get(`${PREFIX}/users/${USER.username}`)
    .set('Authorization', helper.globalToken)
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result).to.have.property('username', USER.username);
      expect(res.body.result).to.have.property('saldos');
      done();
    });
  });

  it('authenticate user', (done) => {
    API
    .post(`${PREFIX}/users/authenticate`)
    .set('Authorization', helper.globalToken)
    .send(USER)
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result.authenticated).to.be.true;
      done();
    });
  });

  const ALTERNATIVE_KEY = 'some_kind_of_id';

  it('create alternative login for user', (done) => {
    API
    .post(`${PREFIX}/users/authenticate/alternative/create`)
    .set('Authorization', helper.globalToken)
    .send({ key: ALTERNATIVE_KEY, groupName: GROUP.groupName, username: USER.username })
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result.key).to.equal(ALTERNATIVE_KEY);
      done();
    });
  });

  it('authenticate with alternative login', (done) => {
    // Right username with right key
    new Promise((resolve, reject) => {
      API
      .post(`${PREFIX}/users/authenticate/alternative`)
      .set('Authorization', helper.globalToken)
      .send({ key: ALTERNATIVE_KEY, groupName: GROUP.groupName })
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
      .set('Authorization', helper.globalToken)
      .send({ key: 'wrong_key', groupName: GROUP.groupName })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result.authenticated).to.be.false;
        resolve();
      });
    }))

    // Wrong username with right key
    .then(() => {
      API
      .post(`${PREFIX}/users/authenticate/alternative`)
      .set('Authorization', helper.globalToken)
      .send({ type: 2, key: ALTERNATIVE_KEY, groupName: GROUP.groupName })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result.authenticated).to.be.false;
        done();
      });
    });
  });

  it('reset password');
  it('reset username');

  it('get groups', (done) => {
    API
    .get(`${PREFIX}/groups`)
    .set('Authorization', helper.globalToken)
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result).to.have.length(seed.data.groups.length);
      done();
    });
  });

  it('get group members', (done) => {
    API
    .get(`${PREFIX}/groups`)
    .set('Authorization', helper.globalToken)
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result).to.have.length(seed.meta.membersInGroup[GROUP.groupName]);
      done();
    });
  });

  it('get group member', (done) => {
    API
    .get(`${PREFIX}/groups/${GROUP.groupName}/members/${USER.username}`)
    .set('Authorization', helper.globalToken)
    .end((err: any, res) => {
      expectOk(err, res);
      expect(res.body.result).to.have.property('username', USER.username);
      expect(res.body.result).to.have.property('saldo');
      done();
    });
  });

  it('create group', (done) => {
    const newGroup = 'new_group';

    // Create new group
    new Promise((resolve, reject) => {
      API
      .post(`${PREFIX}/groups/create`)
      .set('Authorization', helper.globalToken)
      .send({ groupName: newGroup })
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result).to.equal(newGroup)
        done();
      });
    })

    // Check the group exists
    .then(() => {
      API
      .get(`${PREFIX}/groups`)
      .set('Authorization', helper.globalToken)
      .end((err: any, res) => {
        expectOk(err, res);
        expect(res.body.result).to.have.length(seed.data.groups.length + 1);
        done();
      });
    })
  });

  it('add member to group');
  it('remove member from group');
  it('make transaction');
  it('get group transactions');
  it('get user transactions');
  it('get group saldo');
  it('get daily group saldo since');

  it('delete user', (done) => {

    // Delete user
    new Promise((resolve, reject) => {
      API
      .del(`${PREFIX}/users`)
      .set('Authorization', helper.globalToken)
      .send({ username: USER.username})
      .end((err: any, res) => {
        expectOk(err, res);
        resolve();
      });
    })

    // Check if he does still exists
    .then(() => {
      API
      .get(`${PREFIX}/users/${USER.username}`)
      .set('Authorization', helper.globalToken)
      .end((err: any, res) => {
        expectError(err, res);
        expect(res.body.error.type).to.equal('NotFoundError');
        done();
      });
    });
  });
});

