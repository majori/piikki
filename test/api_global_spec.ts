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

