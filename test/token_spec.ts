/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should } from 'chai';
import * as _ from 'lodash';

import * as helper from './helpers';
import { IConfig } from '../src/models/config';

import * as tokenCore from '../src/core/token-core';
import * as groupCore from '../src/core/group-core';
import * as userCore from '../src/core/user-core';

import * as seed from '../seeds/data/test';

describe('Tokens', () => {

  const GROUP = seed.groups[0].groupName;

  before(helper.clearDbAndRunSeed);

  it('get existing tokens from database', async () => {
    const tokens = await tokenCore.getTokens();

    expect(tokens).to.have.length(seed.tokens.length);

    _.forEach(tokens, (token, i) => {
      expect(token).to.have.property('token');
      expect(token).to.have.property('role', seed.tokens[i].role);
      expect(token).to.have.property('comment', seed.tokens[i].comment);
    });
  });

  it('create a new token (restricted and global)', async () => {
    const restricted = await tokenCore.createRestrictedToken(GROUP, 'Organization A');
    expect(restricted).to.be.string;

    const global = await tokenCore.createGlobalToken('For my buddy Bob');
    expect(global).to.be.string;
  });

});
