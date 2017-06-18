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

import { ValidationError } from '../errors';

const _endpoint = {
  makeTransaction: async (req: IExtendedRequest) => {
    let transactions = req.body;

    // Allow body to have one or multiple transactions
    if (!_.isArray(transactions) && _.isObject(transactions)) {
      transactions = [transactions];
    }

    // TODO: If only one transaction fails, tell about the succeed ones
    const results = await Promise.all(_.map(transactions, (trx: ITransactionDto) => {

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

    return (_.size(results) === 1) ? _.first(results) : results;
  },

  getUserTransactions: async (req: IExtendedRequest) => {
    const username = validateUsername(req.params.username);
    const from = validateTimestamp(req.query.from);
    const to = (_.isUndefined(req.query.to)) ? undefined : validateTimestamp(req.query.to);

    return transCore.getUserTransactions(username, from, to);
  },

  getGroupTransactions: async (req: IExtendedRequest) => {
    const groupName = validateGroupName(
      req.piikki.groupAccess.all ? req.params.groupName : req.piikki.groupAccess.group.name
    );
    const from = validateTimestamp(req.query.from);
    const to = (_.isUndefined(req.query.to)) ? undefined : validateTimestamp(req.query.to);


    return transCore.getGroupTransactions(groupName, from, to);
  },

  getUserTransactionsFromGroup: async (req: IExtendedRequest) => {
    const username = validateUsername(req.params.username);
    const groupName = validateGroupName(
      req.piikki.groupAccess.all ? req.params.groupName : req.piikki.groupAccess.group.name
    );
    const from = validateTimestamp(req.query.from);
    const to = (_.isUndefined(req.query.to)) ? undefined : validateTimestamp(req.query.to);

    return transCore.getUserTransactionsFromGroup(username, groupName, from, to);
  },

  getGroupSaldo: async (req: IExtendedRequest) => {
    const groupName = validateGroupName(
      req.piikki.groupAccess.all ? req.params.groupName : req.piikki.groupAccess.group.name
    );
    const from = validateTimestamp(req.query.from);

    const result = await transCore.getGroupSaldo(groupName, from);

    return {
      groupName,
      timestamp: from.format('YYYY-MM-DD'),
      saldo: result.saldo || 0,
    };
  },

  getDailyGroupSaldos: async (req: IExtendedRequest) => {
    const groupName = validateGroupName(
      req.piikki.groupAccess.all ? req.params.groupName : req.piikki.groupAccess.group.name
    );
    const from = validateTimestamp(req.query.from);
    const to = (_.isUndefined(req.query.to)) ? undefined : validateTimestamp(req.query.to);

    return transCore.getDailyGroupSaldosSince(groupName, from, to);
  },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
