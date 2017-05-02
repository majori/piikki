import * as _ from 'lodash';
import * as moment from 'moment';

import { NotFoundError } from '../errors';
import { knex } from '../database';

interface IFilter {
    'users.username'?: string;
    'groups.name'?: string;
}

export async function makeTransaction(username: string, groupName: string, amount: number, tokenId: number, comment?: string) {
    const userSaldo = await userHaveSaldo(username, groupName);

    let newSaldo;
    await knex.transaction(async (trx) => {
        try {
            newSaldo = userSaldo.saldo + amount;

            await trx
                .table('user_saldos')
                .where({user_id: userSaldo.user_id, group_id: userSaldo.group_id})
                .update({saldo: newSaldo})
                .transacting(trx);

            const transaction = {
                new_saldo: newSaldo,
                old_saldo: userSaldo.saldo,
                group_id: userSaldo.group_id,
                user_id: userSaldo.user_id,
                token_id: tokenId,
            };

            await trx
                .table('transactions')
                .insert(
                    _.isString(comment) ?
                    _.assign(transaction, { comment }) :
                    transaction,
                )
                .transacting(trx);

            await trx.commit();

        } catch (err) {
            trx.rollback();
        }
    });

    return { username, saldo: newSaldo };
};

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
};

// Get user's all transactions
export async function getUserTransactions(username: string, sinceTimestamp?: moment.Moment) {
    return _getTransactions({ 'users.username': username }, sinceTimestamp);
};

// Get all group's member transactions
export async function getGroupTransactions(groupName: string, sinceTimestamp?: moment.Moment) {
    return _getTransactions({ 'groups.name': groupName }, sinceTimestamp);
};

// Get transactions of the single member in group
export async function getUserTransactionsFromGroup(username: string, groupName: string, sinceTimestamp?: moment.Moment) {
    return _getTransactions({ 'users.username': username, 'groups.name': groupName }, sinceTimestamp);
};

function _getTransactions(filterObject: IFilter, filterTimestamp?: moment.Moment) {
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
        query.where(
            'transactions.timestamp',
            '>',
            filterTimestamp.format('YYYY-MM-DD HH:mm:ss.SSS')
        );
    }

    return query;
};
