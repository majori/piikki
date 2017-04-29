import { NextFunction, Response } from 'express';
import * as _ from 'lodash';
import { Moment } from 'moment';

import { IExtendedRequest } from '../app';

import * as transCore from '../core/transaction-core';
import {
    createJsonRoute,
    validateTransactionAmount,
    validateGroupName,
    validateUsername,
    validateTimestamp,
} from './endpoint-utils';

interface ITransactionDto {
    username: string;
    amount: number;
    groupName: string;
    comment: string;
}

const _endpoint = {
    makeTransaction: async (req: IExtendedRequest) => {
        let transactions = req.body;

        // Allow body to have one or multiple transactions
        if (!_.isArray(transactions) && _.isObject(transactions)) {
            transactions = [ transactions ];
        }

        // TODO: If only one transaction fails, tell about the succeed ones
        return Promise.all(_.map(transactions, (trx: ITransactionDto) => {

            // If request comes from group specific token, use token related group name
            trx.groupName = (req.piikki.groupAccess.group.name) ?
                req.piikki.groupAccess.group.name :
                trx.groupName;

            const username = validateUsername(trx.username);
            const amount = validateTransactionAmount(trx.amount);
            const groupName = validateGroupName(trx.groupName);

            return transCore.makeTransaction(username, groupName, amount, trx.comment);
        }));
    },

    getUserTransactions: async (req: IExtendedRequest) => {
        const username = validateUsername(req.body.username);
        const timestamp = validateTimestamp(req.body.timestamp);

        return transCore.getUserTransactions(username, timestamp);
    },

    getGroupTransactions: async (req: IExtendedRequest) => {
        const groupName = validateGroupName(req.body.groupName);
        const timestamp = validateTimestamp(req.body.timestamp);

        return transCore.getGroupTransactions(groupName, timestamp);
    },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
