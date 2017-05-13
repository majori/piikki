import * as _ from 'lodash';
import { Moment } from 'moment';

import * as transCore from '../core/transaction-core';
import {
  createJsonRoute,
  validateTransactionAmount,
  validateGroupName,
  validateUsername,
  validateTimestamp,
} from './endpoint-utils';

import { IExtendedRequest } from '../models/http';
import { ITransactionDto } from '../models/transaction';

const _endpoint = {
  makeTransaction: async (req: IExtendedRequest) => {
    let transactions = req.body;

    // Allow body to have one or multiple transactions
    if (!_.isArray(transactions) && _.isObject(transactions)) {
      transactions = [transactions];
    }

    // TODO: If only one transaction fails, tell about the succeed ones
    return Promise.all(_.map(transactions, (trx: ITransactionDto) => {

      // If request comes from group specific token, use token related group name
      trx.groupName = (req.piikki.groupAccess.group.name) ?
        req.piikki.groupAccess.group.name :
        trx.groupName;

      const transaction = {
        username: validateUsername(trx.username),
        amount: validateTransactionAmount(trx.amount),
        groupName: validateGroupName(trx.groupName),
        comment: trx.comment,
        tokenId: req.piikki.token.id,
      };

      return transCore.makeTransaction(transaction);
    }));
  },

  getUserTransactions: async (req: IExtendedRequest) => {
    const username = validateUsername(req.params.username);
    const timestamp = validateTimestamp(req.query.timestamp);

    return transCore.getUserTransactions(username, timestamp);
  },

  getGroupTransactions: async (req: IExtendedRequest) => {
    const groupName = validateGroupName(req.params.groupName);
    const timestamp = validateTimestamp(req.query.timestamp);

    return transCore.getGroupTransactions(groupName, timestamp);
  },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
