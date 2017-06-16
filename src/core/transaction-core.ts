import * as _ from 'lodash';
import * as moment from 'moment';
import { QueryBuilder, JoinClause } from 'knex';

import { NotFoundError } from '../errors';
import { knex } from '../database';
import { IDatabaseTransaction } from '../models/database';
import { ITransactionDto, ITransactionFilter } from '../models/transaction';

export async function makeTransaction(newTrx: ITransactionDto) {
  const userSaldo = await userHaveSaldo(newTrx.username, newTrx.groupName);

  let newSaldo;
  await knex.transaction(async (trx) => {
    try {
      newSaldo = _.round(userSaldo.saldo + newTrx.amount, 2);

      await trx
        .table('user_saldos')
        .where({ user_id: userSaldo.user_id, group_id: userSaldo.group_id })
        .update({ saldo: newSaldo })
        .transacting(trx);

      const transaction = {
        new_saldo: newSaldo,
        old_saldo: userSaldo.saldo,
        group_id: userSaldo.group_id,
        user_id: userSaldo.user_id,
        token_id: newTrx.tokenId,
      };

      await trx
        .table('transactions')
        .insert(
        _.isString(newTrx.comment) ?
          _.assign(transaction, { comment: newTrx.comment }) :
          transaction,
      )
        .transacting(trx);

      await trx.commit();

    } catch (err) {
      trx.rollback();
    }
  });

  return { username: newTrx.username, saldo: newSaldo };
}

export async function userHaveSaldo(username: string, groupName: string) {
  const row = knex
    .from('user_saldos')
    .select('users.id AS user_id', 'groups.id AS group_id', 'user_saldos.saldo')
    .join('users', { 'users.id': 'user_saldos.user_id' })
    .join('groups', { 'groups.id': 'user_saldos.group_id' })
    .where({ 'users.username': username, 'groups.name': groupName })
    .first();

  if (row) {
    return row;
  } else {
    throw new NotFoundError(`User ${username} has no saldo in group ${groupName}`);
  }
}

// Get user's all transactions
export async function getUserTransactions(username: string, from?: moment.Moment, to?: moment.Moment) {
  return _getTransactions({ 'users.username': username }, from);
}

// Get all group's member transactions
export async function getGroupTransactions(groupName: string, from?: moment.Moment, to?: moment.Moment) {
  return _getTransactions({ 'groups.name': groupName }, from);
}

// Get transactions of the single member in group
// tslint:disable-next-line:max-line-length
export async function getUserTransactionsFromGroup(username: string, groupName: string, from?: moment.Moment, to?: moment.Moment) {
  return _getTransactions({ 'users.username': username, 'groups.name': groupName }, from);
}

// Returns group's absolute saldo in given date
export async function getGroupSaldo(groupName: string, from: moment.Moment): Promise<{ saldo: number | null }> {
  const date = moment(from).endOf('day').format();
  return knex
    .with('T1', (qb: QueryBuilder) => {
      qb
        .select('user_id')
        .max('timestamp as latest_transaction')
        .from('transactions')
        .join('groups', { 'transactions.group_id': 'groups.id' })
        .where('timestamp', '<', date)
        .andWhere('groups.name', '=', groupName)
        .groupBy('user_id');
    })
    .sum('new_saldo as saldo')
    .from('T1')
    .join('transactions', (qb: JoinClause) => {
      qb
        .on('T1.user_id', '=', 'transactions.user_id')
        .andOn('T1.latest_transaction', '=', 'transactions.timestamp');
    })
    .first();
}

// Get changes in saldo from each day between [from] and [to] (doesn't generate days with zero change)
export async function getDeltaDailyGroupSaldosSince(groupName: string, from: moment.Moment, to?: moment.Moment) {
  return knex
    .select(
      'timestamp',
      knex.raw('SUM(new_saldo - old_saldo) as saldo_change'),
    )
    .from('transactions')
    .join('groups', { 'groups.id': 'transactions.group_id'})
    .where('groups.name', '=', groupName)
    .andWhere('transactions.timestamp', '>=', moment(from).startOf('day').format())
    .andWhere('transactions.timestamp', '<=', moment(to).endOf('day').format())
    .groupBy('transactions.timestamp');
}

// Get absolute saldo for each day between [from] -> [to]
export async function getDailyGroupSaldosSince(groupName: string, from: moment.Moment, to?: moment.Moment) {
  const toMoment = to ? to : moment().utc();

  // Calculate absolute saldo of the first day
  const startSaldo = (await getGroupSaldo(groupName, from)).saldo || 0;

  // How much change happened in each day
  const deltaSaldos = _.chain(await getDeltaDailyGroupSaldosSince(groupName, from, toMoment))
    .map((transaction: any) => _.update(transaction, 'timestamp', (date: string) => moment(date).utc()))
    .groupBy((transaction: any) => transaction.timestamp.format('YYYY-MM-DD'))
    .mapValues((transactions: any) =>
      _.reduce(transactions, (total, transaction: any) => total + transaction.saldo_change, 0),
    )
    .value();

  const time = moment(from).startOf('day');
  const saldos = [{ timestamp: time.format(), saldo: startSaldo }]; // Init the first day with saldo
  let currentSaldo = startSaldo;
  time.add(1, 'day');

  // Loop over each day until [to] date is passed
  while (time.isBefore(toMoment.endOf('day'))) {
    currentSaldo = currentSaldo + (deltaSaldos[time.format('YYYY-MM-DD')] || 0);

    saldos.push({
      timestamp: time.format(),
      saldo: currentSaldo,
    });
    time.add(1, 'day');
  }

  return saldos;
}

async function _getTransactions(filterObject: ITransactionFilter, from?: moment.Moment, to?: moment.Moment) {
  const query = knex
    .from('transactions')
    .select(
      'users.username',
      'groups.name AS groupName',
      'transactions.timestamp',
      'transactions.old_saldo AS oldSaldo',
      'transactions.new_saldo AS newSaldo',
      'transactions.comment',
    )
    .join('users', { 'users.id': 'transactions.user_id' })
    .join('groups', { 'groups.id': 'transactions.group_id' })
    .orderBy('transactions.timestamp', 'desc')
    .where(filterObject);

  if (from) {
    query.where(
      'transactions.timestamp',
      '>',
      from.format(),
    );
  }

  query.where(
    'transactions.timestamp',
    '<',
    _.defaultTo(to, moment().utc()).format(),
  );

  const results: IDatabaseTransaction[] = await query;

  // Omit comment field if it is null
  return _.map(results, (row) => (row.comment) ? row : _.omit(row, ['comment']));
}
