import * as Promise from 'bluebird';
import * as _ from 'lodash';

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
            Promise.reject(`User ${username} has no saldo in group ${groupName}`) :
            Promise.resolve(row)
        )
}