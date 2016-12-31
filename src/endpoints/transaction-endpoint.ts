import * as Promise from 'bluebird';
import { NextFunction, Response } from 'express';
import * as _ from 'lodash';
import { IExtendedRequest } from '../app';

import * as transCore from '../core/transaction-core';
import {
    badRequestError,
    createJsonRoute,
    validateTransactionAmount,
    validateGroupName,
    validateUsername,
} from './endpoint-utils';

export const makeTransaction = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction): Promise<any> => {
    let transactions = req.body;

    // Allow body to have one or multiple transactions
    if (!_.isArray(transactions) && _.isObject(transactions)) {
        transactions = [ transactions ];
    }

    // TODO: If only one transaction fails, tell about the succeed ones
    return Promise.map(transactions, (trx: any) => {

        // If request comes from group specific token, use token related group name
        trx.groupName = (req.groupAccess.group.name) ? req.groupAccess.group.name : trx.groupName;

        return Promise.all([
            validateTransactionAmount(trx.amount),
            validateUsername(trx.username),
            validateGroupName(trx.groupName)
        ])
        .then(() => transCore.makeTransaction(trx.username, trx.groupName, trx.amount, trx.comment))
        .catch((err) => Promise.reject(badRequestError(err)));
    });
});
