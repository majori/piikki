import * as transCore from '../core/transaction-core';
import {
    badRequestError,
    createJsonRoute,
    validateTransactionAmount,
    validateUser,
    validateUsername
} from './endpoint-utils';

export const makeTransaction = createJsonRoute((req, res) => {
    let username: any = req.body.username;
    let amount: any = req.body.amount;
    let comment: any = req.body.comment;

    return  validateTransactionAmount(amount)
        .then(() => validateUsername(username))
        .then(() => transCore.makeTransaction(username, amount, comment))
        .catch((err) => Promise.reject(badRequestError(err)));
});
