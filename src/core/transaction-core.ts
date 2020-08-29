import * as _ from 'lodash';
import * as moment from 'moment';
import { QueryBuilder, JoinClause } from 'knex';
import { notFound } from 'boom';

import { knex } from '../database';
import { Logger } from '../logger';
import { getUserFromGroup } from './group-core';

const logger = new Logger(__filename);

export async function makeTransaction(newTrx: TransactionDto) {
  interface QueryOutput {
    user_id: string;
    group_id: string;
    saldo: number;
  }

  const amount = _.round(newTrx.amount, 2);

  // Return users current saldo if amount is zero
  if (amount === 0) {
    return getUserFromGroup(newTrx.groupName, newTrx.username);
  }

  const saldo = await knex.transaction(async (trx) => {
    try {
      const result = await trx.raw(
        `
        UPDATE "user_saldos" as S
        SET saldo = round((saldo + ?)::numeric, 2)
        FROM "users" as U, "groups" AS G
          WHERE U.id = S.user_id
          AND G.id = S.group_id
          AND U.username = ?
          AND G.name = ?
        RETURNING saldo, user_id, group_id
      `,
        [amount, newTrx.username, newTrx.groupName],
      );

      const newSaldo: QueryOutput | undefined = _.first(result.rows);

      if (_.isUndefined(newSaldo)) {
        throw notFound(
          `User "${newTrx.username}" was not found in group "${newTrx.groupName}`,
        );
      }

      const transaction = {
        new_saldo: newSaldo.saldo,
        old_saldo: _.round(newSaldo.saldo - amount, 2),
        group_id: newSaldo.group_id,
        user_id: newSaldo.user_id,
        token_id: newTrx.tokenId,
        comment: newTrx.comment,
        timestamp: newTrx.timestamp,
      };

      await knex('transactions').transacting(trx).insert(transaction);

      logger.debug('New transaction', transaction);
      return trx.commit(newSaldo.saldo);
    } catch (err) {
      logger.error(err);
      await trx.rollback();
      throw err;
    }
  });

  return { username: newTrx.username, saldo };
}

// Get user's all transactions
export async function getUserTransactions(
  username: string,
  from?: moment.Moment,
  to?: moment.Moment,
) {
  return _getTransactions({ 'users.username': username }, from, to);
}

// Get all group's member transactions
export async function getGroupTransactions(
  groupName: string,
  from?: moment.Moment,
  to?: moment.Moment,
) {
  return _getTransactions({ 'groups.name': groupName }, from, to);
}

// Get transactions of the single member in group
// tslint:disable-next-line:max-line-length
export async function getUserTransactionsFromGroup(
  username: string,
  groupName: string,
  from?: moment.Moment,
  to?: moment.Moment,
) {
  return _getTransactions(
    { 'users.username': username, 'groups.name': groupName },
    from,
    to,
  );
}

// Returns group's absolute saldo in given date
export async function getGroupSaldo(groupName: string, from: moment.Moment) {
  return knex
    .with('T1', (qb: QueryBuilder) => {
      qb.select('user_id')
        .max('timestamp as latest_transaction')
        .from('transactions')
        .join('groups', { 'transactions.group_id': 'groups.id' })
        .where('timestamp', '<', moment(from).endOf('day').toISOString())
        .andWhere('groups.name', '=', groupName)
        .groupBy('user_id');
    })
    .sum('new_saldo as saldo')
    .from('T1')
    .join('transactions', (qb: JoinClause) => {
      qb.on('T1.user_id', '=', 'transactions.user_id').andOn(
        'T1.latest_transaction',
        '=',
        'transactions.timestamp',
      );
    })
    .first();
}

// Get absolute saldo for each day between [from] -> [to]
export async function getDailyGroupSaldosSince(
  groupName: string,
  from: moment.Moment,
  to?: moment.Moment,
) {
  const toMoment = to ? to : moment().utc();

  // Calculate absolute saldo of the first day
  const startSaldo = (await getGroupSaldo(groupName, from))?.saldo || 0;

  // How much change happened in each day
  const deltaSaldos = _.chain(
    await _getDeltaDailyGroupSaldosSince(groupName, from, toMoment),
  )
    .map((transaction: any) =>
      _.update(transaction, 'timestamp', (date: string) => moment(date)),
    )
    .groupBy((transaction: any) => transaction.timestamp.format('YYYY-MM-DD'))
    .mapValues((transactions: any) => _.sumBy(transactions, 'saldo_change'))
    .value();

  const time = moment(from).startOf('day');
  const saldos = [{ timestamp: time.format('YYYY-MM-DD'), saldo: startSaldo }]; // Init the first day with saldo
  let currentSaldo = startSaldo;
  time.add(1, 'day');

  // Loop over each day until [to] date is passed
  while (time.isBefore(toMoment.endOf('day'))) {
    currentSaldo = currentSaldo + (deltaSaldos[time.format('YYYY-MM-DD')] || 0);

    saldos.push({
      timestamp: time.format('YYYY-MM-DD'),
      saldo: _.round(currentSaldo, 2),
    });
    time.add(1, 'day');
  }

  return saldos;
}

// Get changes in saldo from each day between [from] and [to] (doesn't generate days with zero change)
async function _getDeltaDailyGroupSaldosSince(
  groupName: string,
  from: moment.Moment,
  to?: moment.Moment,
) {
  return knex
    .select('timestamp', knex.raw('SUM(new_saldo - old_saldo) as saldo_change'))
    .from('transactions')
    .join('groups', { 'groups.id': 'transactions.group_id' })
    .where('groups.name', '=', groupName)
    .andWhere('transactions.timestamp', '>=', moment(from).toISOString())
    .andWhere(
      'transactions.timestamp',
      '<=',
      moment(to).endOf('day').toISOString(),
    )
    .groupBy('transactions.timestamp')
    .orderBy('transactions.timestamp', 'desc');
}

async function _getTransactions(
  filterObject: TransactionFilter,
  from?: moment.Moment,
  to?: moment.Moment,
) {
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
    .where(filterObject)
    .where('transactions.timestamp', '<=', moment(to).toISOString());

  if (from) {
    query.where('transactions.timestamp', '>=', moment(from).toISOString());
  }

  const results: DatabaseTransaction[] = await query;

  // Omit comment field if it is null
  return _.map(results, (row) =>
    row.comment ? row : _.omit(row, ['comment']),
  );
}
