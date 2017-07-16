/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should } from 'chai';
import * as _ from 'lodash';
import * as path from 'path';

import * as helper from '../helpers';
import * as seed from '../../seeds/data/test';
import * as transactionCore from '../../src/core/transaction-core';
import * as userCore from '../../src/core/user-core';

describe('Transactions', () => {

  const USER = _.clone(helper.user);
  const GROUP = _.clone(helper.group);
  const ORIGINAL_SALDO: number = seed.meta.saldos[USER.username][GROUP.groupName];

  beforeEach(helper.clearDbAndRunSeed);

  async function makeTransaction(amount: number) {
    return transactionCore.makeTransaction({
      username: USER.username,
      groupName: GROUP.groupName,
      amount,
      tokenId: 1,
    });
  }

  it('make a transaction', async () => {
    const amount = 10;

    const trx1 = await makeTransaction(amount);

    expect(trx1).to.have.property('username', USER.username);
    expect(trx1).to.have.property('saldo', ORIGINAL_SALDO + amount);

    const user1 = await userCore.getUser(USER.username);
    expect(user1).to.containSubset({ saldos: { [GROUP.groupName]: ORIGINAL_SALDO + amount } });

    const trx2 = await makeTransaction(-amount);

    expect(trx2).to.have.property('username', USER.username);
    expect(trx2).to.have.property('saldo', ORIGINAL_SALDO);

    const user2 = await userCore.getUser(USER.username);
    expect(user2).to.containSubset({ saldos: { [GROUP.groupName]: ORIGINAL_SALDO } });
  });

  it.skip('can handle multiple requests atomically', async () => {
    const trx = _.flatten(_.times(3, () => {
      const amount = _.random(5, 20);
      return [
        makeTransaction(amount),
        makeTransaction(-amount),
      ];
    }));

    const results = await Promise.all(trx);

    const user = await userCore.getUser(USER.username);
    expect(user).to.containSubset({ saldos: { [GROUP.groupName]: ORIGINAL_SALDO } });
  });
});
