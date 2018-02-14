/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should } from 'chai';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as path from 'path';
import * as BBPromise from 'bluebird';

import * as helper from '../helpers';
import * as seed from '../../seeds/data/test';
import * as transactionCore from '../../src/core/transaction-core';
import * as userCore from '../../src/core/user-core';

describe('Transactions', () => {

  const USER = _.clone(helper.user);
  const GROUP = _.clone(helper.group);
  const ORIGINAL_SALDO: number = seed.meta.saldos[USER.username][GROUP.groupName];

  async function makeTransaction(amount: number) {
    return transactionCore.makeTransaction({
      username: USER.username,
      groupName: GROUP.groupName,
      amount,
      tokenId: 1,
    });
  }

  // Make symmetric transactions, so final saldo is the same as original saldo
  async function makeMultipleTransactions(times: number) {
    for (const index of _.times(times)) {
      const amount = index + 1;
      await makeTransaction(amount);
      await BBPromise.delay(3); // Wait couple milliseconds so transactions can't have same timestamp
      await makeTransaction(-amount);
    }
  }

  beforeEach(helper.clearDbAndRunSeed);

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

  it('can handle fast transactions', async () => {
    await makeMultipleTransactions(10);

    // Final user saldo stays consistent
    const user = await userCore.getUser(USER.username);
    expect(user).to.containSubset({ saldos: { [GROUP.groupName]: ORIGINAL_SALDO } });

    // Transactions has to stay in chronological order
    const transactions = await transactionCore.getUserTransactions(
      USER.username,
      moment().subtract(1, 'minute').utc(),
      moment().add(1, 'minute').utc(),
    );

    _.reduce(
      _.orderBy(transactions, ['timestamp', 'asc']),
      (old: number, transaction: any) => {
        expect(transaction.oldSaldo).to.equal(old);
        return transaction.newSaldo;
      }, 0);
  });
});
