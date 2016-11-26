import * as Promise from 'bluebird';
import * as _ from 'lodash';

import { knex } from '../database';
import { userExists } from './user-core';

export function makeTransaction(username: string, amount: number, comment?: string) {
    let transaction;

    return userExists(username)
        .then((fetchedUser) => knex.transaction((trx) =>
            trx.table('users')
            .where({username: fetchedUser.username})
            .update({saldo: fetchedUser.saldo + amount})
            .then(() => Promise.resolve({
                newSaldo: fetchedUser.saldo + amount,
                oldSaldo: fetchedUser.saldo,
                userId: fetchedUser.id
            }))
            .then((result) => {
                transaction = result;
                return trx.table('transactions')
                .insert(_.isString(comment) ? _.assign(transaction, { comment }) : transaction );
            })
            .then(trx.commit)
            .catch(trx.rollback)
        ))
        .then(() => Promise.resolve({ username, saldo: transaction.newSaldo }));
};
