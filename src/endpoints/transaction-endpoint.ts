import * as Promise from 'bluebird';
import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';

import * as transCore from '../core/transaction-core';
import {
    badRequestError,
    createJsonRoute,
    validateTransactionAmount,
    validateUser,
    validateUsername
} from './endpoint-utils';

export const makeTransaction = createJsonRoute((req: Request, res: Response, next: NextFunction): Promise<any> => {

    let transactions = req.body;

    if (!_.isArray(transactions) && _.isObject(transactions)) {
        transactions = [ transactions ];
    }

    // TODO: If only one transaction fails, tell about the succeed ones
    return Promise.map(transactions, (transaction: any) => validateTransactionAmount(transaction.amount)
        .then(() => validateUsername(transaction.username))
        .then(() => transCore.makeTransaction(transaction.username, transaction.amount, transaction.comment)
            .catch((err) => badRequestError(err))
        )
    );
});
