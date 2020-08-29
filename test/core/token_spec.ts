/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should } from 'chai';
import * as _ from 'lodash';

import * as helper from '../helpers';
import * as tokenCore from '../../src/core/token-core';
import * as groupCore from '../../src/core/group-core';
import * as userCore from '../../src/core/user-core';
import * as seed from '../../seeds/data/test';

describe('Tokens', () => {
  const GROUPNAME = seed.data.groups[0].groupName;

  beforeEach(helper.clearDbAndRunSeed);

  it('get existing tokens from database', async () => {
    const tokens = await tokenCore.getTokens();

    expect(tokens).to.have.length(seed.data.tokens.length);

    _.forEach(tokens, (token, i) => {
      expect(token).to.have.property('token');
      expect(token).to.have.property('role');
      expect(token).to.have.property('comment');
    });
  });

  it('create a new token', async () => {
    const commentA = 'Organization A';
    const restricted = await tokenCore.createRestrictedToken(
      GROUPNAME,
      commentA,
    );
    expect(restricted).to.be.string;
    expect(await tokenCore.getToken(commentA)).to.containSubset({
      token: restricted,
    });

    const commentB = 'For my buddy Bob';
    const global = await tokenCore.createGlobalToken(commentB);
    expect(global).to.be.string;
    expect(await tokenCore.getToken(commentB)).to.containSubset({
      token: global,
    });

    const commentC = 'For the allmighty';
    const admin = await tokenCore.createAdminToken(commentC);
    expect(admin).to.be.string;
    expect(await tokenCore.getToken(commentC)).to.containSubset({
      token: admin,
    });
  });

  it('delete token', async () => {
    await tokenCore.deleteToken(seed.data.tokens[0].token);
    const tokens = await tokenCore.getTokens();
    expect(tokens).to.have.length(seed.data.tokens.length - 1);
  });
});
