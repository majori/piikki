import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as moment from 'moment';

import { NotFoundError } from '../errors';
import { knex } from '../database';

export function makeTransaction(username: string, groupName: string, amount: number, comment?: string) {
    let transaction;

    return userHaveSaldo(username, groupName)
        .then((userSaldo: any) => knex.transaction((trx) => trx
            .table('user_saldos')
            .where({user_id: userSaldo.user_id, group_id: userSaldo.group_id})
            .update({saldo: userSaldo.saldo + amount})
            .then(() => Promise.resolve({
                new_saldo: userSaldo.saldo + amount,
                old_saldo: userSaldo.saldo,
                group_id: userSaldo.group_id,
                user_id: userSaldo.user_id
            }))
            .then((result) => {
                transaction = result;
                return trx.table('transactions').insert(
                    _.isString(comment) ?
                    _.assign(transaction, { comment }) :
                    transaction
                );
            })
            .then(trx.commit)
            .catch(trx.rollback)
        ))
        .then(() => Promise.resolve({ username, saldo: transaction.new_saldo }));
};

export function userHaveSaldo(username: string, groupName: string) {
    return knex
        .from('user_saldos')
        .select('users.id AS user_id', 'groups.id AS group_id', 'user_saldos.saldo')
        .join('users', { 'users.id': 'user_saldos.user_id' })
        .join('groups', { 'groups.id': 'user_saldos.group_id' })
        .where({ 'users.username': username, 'groups.name': groupName })
        .first()
        .then((row) =>  _.isUndefined(row) ?
            Promise.reject(new NotFoundError(`User ${username} has no saldo in group ${groupName}`)) :
            Promise.resolve(row)
        );
};

// Get user's all transactions
export function getUserTransactions(username: string, sinceTimestamp?: moment.Moment) {
    return _getTransactions({ 'users.username': username }, sinceTimestamp);
};

// Get all group's member transactions
export function getGroupTransactions(groupName: string, sinceTimestamp?: moment.Moment) {
    return _getTransactions({ 'groups.name': groupName }, sinceTimestamp);
};

// Get transactions of the single member in group
export function getUserTransactionsFromGroup(username: string, groupName: string, sinceTimestamp?: moment.Moment) {
    return _getTransactions({ 'users.username': username, 'groups.name': groupName }, sinceTimestamp);
};

function _getTransactions(filterObject: object, filterTimestamp?: moment.Moment) {
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
        .where(filterObject);

    if (filterTimestamp) {
        query.where('transactions.timestamp', '>', filterTimestamp.format());
    }

    return query;
};
