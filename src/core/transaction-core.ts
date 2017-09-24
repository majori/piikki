import * as _ from 'lodash';
import * as moment from 'moment';
import { QueryBuilder, JoinClause } from 'knex';

import { NotFoundError } from '../errors';
import { knex } from '../database';
import { DatabaseTransaction } from '../models/database';
import { TransactionDto, TransactionFilter } from '../models/transaction';
import { Logger } from '../logger';

const logger = new Logger(__filename);

export async function makeTransaction(newTrx: TransactionDto) {
  type QueryOutput = { 'user_id': string; 'group_id': string; saldo: number; };

  const amount = _.round(newTrx.amount, 2);

  if (amount === 0) {
    return;
  }

  try {
    const result: QueryOutput[] = await knex.raw(`
      UPDATE S
      SET S.[saldo] = S.[saldo] + ?
      OUTPUT INSERTED.[saldo], INSERTED.[user_id], INSERTED.[group_id]
      FROM [user_saldos] as S
      INNER JOIN [users] as U
        ON U.[id] = S.[user_id]
      INNER JOIN [groups] AS G
        ON G.[id] = S.[group_id]
      WHERE U.[username] = ?
        AND G.[name] = ?
    `, [amount, newTrx.username, newTrx.groupName]);

    const newSaldo: QueryOutput | undefined = _.first(result);

    if (_.isUndefined(newSaldo)) {
      throw new NotFoundError(`User "${newTrx.username}" was not found in group "${newTrx.groupName}`);
    }

    const transaction = {
      new_saldo: newSaldo.saldo,
      old_saldo: newSaldo.saldo - amount,
      group_id: newSaldo.group_id,
      user_id: newSaldo.user_id,
      token_id: newTrx.tokenId,
    };

    await knex
      .table('transactions')
      .insert(
        _.isString(newTrx.comment) ?
        _.assign(transaction, { comment: newTrx.comment }) :
        transaction,
      );

    logger.debug('New transaction', transaction);

    return { username: newTrx.username, saldo: newSaldo.saldo };
  } catch (err) {
    throw err;
  }
}

// Get user's all transactions
export async function getUserTransactions(username: string, from?: moment.Moment, to?: moment.Moment) {
  return _getTransactions({ 'users.username': username }, from, to);
}

// Get all group's member transactions
export async function getGroupTransactions(groupName: string, from?: moment.Moment, to?: moment.Moment) {
  return _getTransactions({ 'groups.name': groupName }, from, to);
}

// Get transactions of the single member in group
// tslint:disable-next-line:max-line-length
export async function getUserTransactionsFromGroup(username: string, groupName: string, from?: moment.Moment, to?: moment.Moment) {
  return _getTransactions({ 'users.username': username, 'groups.name': groupName }, from, to);
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

// Get absolute saldo for each day between [from] -> [to]
export async function getDailyGroupSaldosSince(groupName: string, from: moment.Moment, to?: moment.Moment) {
  const toMoment = to ? to : moment().utc();

  // Calculate absolute saldo of the first day
  const startSaldo = (await getGroupSaldo(groupName, from)).saldo || 0;

  // How much change happened in each day
  const deltaSaldos = _.chain(await _getDeltaDailyGroupSaldosSince(groupName, from, toMoment))
    .map((transaction: any) => _.update(transaction, 'timestamp', (date: string) => moment(date).utc()))
    .groupBy((transaction: any) => transaction.timestamp.format('YYYY-MM-DD'))
    .mapValues((transactions: any) =>
      _.reduce(transactions, (total, transaction: any) => total + transaction.saldo_change, 0),
    )
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
      saldo: currentSaldo,
    });
    time.add(1, 'day');
  }

  return saldos;
}

// Get changes in saldo from each day between [from] and [to] (doesn't generate days with zero change)
async function _getDeltaDailyGroupSaldosSince(groupName: string, from: moment.Moment, to?: moment.Moment) {
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

async function _getTransactions(filterObject: TransactionFilter, from?: moment.Moment, to?: moment.Moment) {
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
    moment(to).utc().format(),
  );

  const results: DatabaseTransaction[] = await query;

  // Omit comment field if it is null
  return _.map(results, (row) => (row.comment) ? row : _.omit(row, ['comment']));
}
