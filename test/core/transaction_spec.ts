/* tslint:disable:no-unused-expression */
import 'mocha';
import { expect, assert, should } from 'chai';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as path from 'path';

import * as helper from '../helpers';
import * as seed from '../../seeds/data/test';
import * as transactionCore from '../../src/core/transaction-core';
import * as userCore from '../../src/core/user-core';

describe('Transactions', () => {

  const USER = _.clone(helper.user);
  const GROUP = _.clone(helper.group);
  const ORIGINAL_SALDO: number = seed.meta.saldos[USER.username][GROUP.groupName];

  async function makeTransaction(amount: number, comment?: string) {
    return transactionCore.makeTransaction({
      username: USER.username,
      groupName: GROUP.groupName,
      amount,
      tokenId: 1,
      timestamp: moment().toISOString(),
      comment,
    });
  }

  // Make symmetric transactions, so final saldo is the same as original saldo
  async function makeMultipleTransactions(times: number) {
    for (const index of _.times(times)) {
      const amount = index + 1;
      await makeTransaction(amount);
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

  it('make a transaction with a comment', async () => {
    const comment = 'test_comment';
    await makeTransaction(5, comment);

    const transactions = await transactionCore.getUserTransactions(USER.username);
    expect(transactions[0]).to.containSubset({ comment });
  });

  it('transaction with very small amount', async () => {
    const trx = await makeTransaction(1e-10);
    expect(trx.saldo).to.equal(seed.meta.saldos.testUser1.group1);
  });

  it('can handle fast transactions', async () => {

    const start = moment();
    const count = 30;
    await makeMultipleTransactions(count);

    // Final user saldo stays consistent
    const user = await userCore.getUser(USER.username);
    expect(user).to.containSubset({ saldos: { [GROUP.groupName]: ORIGINAL_SALDO } });

    // Transactions has to stay in chronological order
    const transactions = await transactionCore.getUserTransactions(
      USER.username,
      start,
    );

    expect(transactions).to.have.length(count * 2);

    _.reduce(
      _.reverse(transactions),
      (old: number, transaction: any) => {
        expect(transaction.oldSaldo).to.equal(old);
        return transaction.newSaldo;
      }, ORIGINAL_SALDO);
  });
});
