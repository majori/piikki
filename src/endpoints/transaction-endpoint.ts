import * as _ from 'lodash';
import * as moment from 'moment';
import { Endpoint } from 'types/endpoints';
import * as transCore from '../core/transaction-core';
import { createJsonRoute } from '../utils/endpoint';
import validate from '../utils/validators';

const endpoint: Endpoint = {
  makeTransaction: async (req) => {
    let transactions = req.body;

    // Allow body to have one or multiple transactions
    if (!_.isArray(transactions) && _.isObject(transactions)) {
      transactions = [transactions];
    }

    // TODO: If only one transaction fails, tell about the succeed ones
    const results = await Promise.all(_.map(transactions, (trx: TransactionDto) => {

      // If request comes from group specific token, use token related group name
      trx.groupName = (req.piikki.groupAccess.group.name) ?
        req.piikki.groupAccess.group.name :
        trx.groupName;

      const transaction = {
        username: validate.username(trx.username),
        amount: validate.transactionAmount(trx.amount),
        groupName: validate.groupName(trx.groupName),
        comment: trx.comment,
        tokenId: req.piikki.token.id,
      };

      return transCore.makeTransaction(transaction);
    }));

    return (_.size(results) === 1) ? _.first(results) : results;
  },

  getUserTransactions: async (req) => {
    const username = validate.username(req.params.username);
    const from = validate.timestamp(req.query.from);
    const to = (_.isUndefined(req.query.to)) ? undefined : validate.timestamp(req.query.to);

    return transCore.getUserTransactions(username, from, to);
  },

  getGroupTransactions: async (req) => {
    const groupName = validate.groupName(req.piikki.groupAccess.group.name);
    const from = validate.timestamp(req.query.from);
    const to = (_.isUndefined(req.query.to)) ? undefined : validate.timestamp(req.query.to);

    return transCore.getGroupTransactions(groupName, from, to);
  },

  getUserTransactionsFromGroup: async (req) => {
    const username = validate.username(req.params.username);
    const groupName = validate.groupName(req.piikki.groupAccess.group.name);
    const from = validate.timestamp(req.query.from);
    const to = (_.isUndefined(req.query.to)) ? undefined : validate.timestamp(req.query.to);

    return transCore.getUserTransactionsFromGroup(username, groupName, from, to);
  },

  getGroupSaldo: async (req) => {
    const groupName = validate.groupName(req.piikki.groupAccess.group.name);
    // Default to present if from-date is not given
    const from = req.query.from ? validate.timestamp(req.query.from) : moment().utc();

    const result = await transCore.getGroupSaldo(groupName, from);

    return {
      groupName,
      timestamp: from.format('YYYY-MM-DD'),
      saldo: result.saldo || 0,
    };
  },

  getDailyGroupSaldos: async (req) => {
    const groupName = validate.groupName(req.piikki.groupAccess.group.name);
    const from = validate.timestamp(req.query.from);
    const to = (_.isUndefined(req.query.to)) ? undefined : validate.timestamp(req.query.to);

    return transCore.getDailyGroupSaldosSince(groupName, from, to);
  },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(endpoint, createJsonRoute);
