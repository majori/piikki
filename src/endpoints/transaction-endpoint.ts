import * as Promise from 'bluebird';
import { NextFunction, Response } from 'express';
import * as _ from 'lodash';
import { Moment } from 'moment';

import { IExtendedRequest } from '../app';

import * as transCore from '../core/transaction-core';
import {
    badRequestError,
    createJsonRoute,
    validateTransactionAmount,
    validateGroupName,
    validateUsername,
    validateTimestamp,
} from './endpoint-utils';

const _endpoint = {
    makeTransaction: (req: IExtendedRequest) => {
        let transactions = req.body;

        // Allow body to have one or multiple transactions
        if (!_.isArray(transactions) && _.isObject(transactions)) {
            transactions = [ transactions ];
        }

        // TODO: If only one transaction fails, tell about the succeed ones
        return Promise.map(transactions, (trx: any) => {

            // If request comes from group specific token, use token related group name
            trx.groupName = (req.piikki.groupAccess.group.name) ? req.piikki.groupAccess.group.name : trx.groupName;

            return Promise.all([
                validateTransactionAmount(trx.amount),
                validateUsername(trx.username),
                validateGroupName(trx.groupName)
            ])
            .then(() => transCore.makeTransaction(trx.username, trx.groupName, trx.amount, trx.comment));
        });
    },

    getUserTransactions: (req: IExtendedRequest) => {
        const username = req.body.username;
        const timestamp = req.body.timestamp;

        return Promise.all([
                validateUsername(username),
                validateTimestamp(timestamp),
            ])
            .spread((vUsername: string, optTimestamp?: Moment) => transCore
                .getUserTransactions(vUsername, optTimestamp)
            );
    },

    getGroupTransactions: (req: IExtendedRequest) => {
        const groupName = req.body.groupName;
        const timestamp = req.body.timestamp;

        return Promise.all([
                validateGroupName(groupName),
                validateTimestamp(timestamp),
            ])
            .spread((vGroupName: string, optTimestamp?: Moment) => transCore
                .getGroupTransactions(vGroupName, optTimestamp)
            );
    },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
