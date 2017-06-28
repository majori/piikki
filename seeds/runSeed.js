const bcrypt = require('bcrypt');
const _ = require('lodash');

module.exports = (knex, Promise, data) => {

  // Deletes ALL existing entries
  return knex('token_group_access').del()
    .then(() => knex('transactions').del())
    .then(() => knex('user_saldos').del())
    .then(() => knex('tokens').del())
    .then(() => knex('users').del())
    .then(() => knex('groups').del())

    // USERS
    .then(() => knex.raw(_.join(
      [
        'SET IDENTITY_INSERT users ON;',
        'INSERT INTO users(id, username, password) VALUES',
        _.chain(data.users)
          .map((user, i) =>
            `(${i},'${user.username}','${bcrypt.hashSync(user.password, 6)}')`
          )
          .join(',')
          .value(),
        ';SET IDENTITY_INSERT users OFF;'
      ], ' ')
    ))

    // GROUPS
    .then(() => knex.raw(_.join(
      [
        'SET IDENTITY_INSERT groups ON;',
        'INSERT INTO groups(id, name) VALUES ',
        _.chain(data.groups)
          .map((group, i) =>
            `(${i}, '${group.groupName}')`
          )
          .join(',')
          .value(),
        ';SET IDENTITY_INSERT groups OFF;'
      ], ' ')
    ))

    // USER SALDOS
    .then(() => knex.raw(_.join(
      [
        'SET IDENTITY_INSERT user_saldos ON;',
        'INSERT INTO user_saldos(id, user_id, group_id, saldo) VALUES ',
        _.chain(data.userSaldos)
          .map((saldo, i) =>
            `(
              ${i},
              ${_.findIndex(data.users, ['username', saldo.username])},
              ${_.findIndex(data.groups, ['groupName', saldo.groupName])},
              ${saldo.saldo}
            )`
          )
          .join(',')
          .value(),
        ';SET IDENTITY_INSERT user_saldos OFF;'
      ], ' ')
    ))

    // TOKENS
    .then(() => knex.raw(_.join(
      [
        'SET IDENTITY_INSERT tokens ON;',
        'INSERT INTO tokens(id, token, role, comment) VALUES ',
        _.chain(data.tokens)
          .map((token, i) => `(${i},'${token.token}','${token.role}','${token.comment}')`)
          .join(',')
          .value(),
        ';SET IDENTITY_INSERT tokens OFF;'
      ], ' ')
    ))

    // TOKEN GROUP ACCESS
    .then(() => knex.raw(_.join(
      [
        'SET IDENTITY_INSERT token_group_access ON;',
        'INSERT INTO token_group_access(id, token_id, group_id) VALUES ',
        _.chain(data.tokenGroupAccess)
          .map((access, i) =>
            `(
              ${i},
              ${_.findIndex(data.tokens, ['token', access.token])},
              ${_.findIndex(data.groups, ['groupName', access.groupName])}
            )`
          )
          .join(',')
          .value(),
        ';SET IDENTITY_INSERT token_group_access OFF;'
      ], ' ')
    ))

    // TRANSACTIONS
    .then(() => knex.raw(_.join(
      [
        'SET IDENTITY_INSERT transactions ON;',
        'INSERT INTO transactions (id, user_id, group_id, token_id, timestamp, old_saldo, new_saldo) VALUES ',
        _.chain(data.transactions)
          .map((transaction, i) =>
            `(
              ${i},
              ${_.findIndex(data.users, ['username', transaction.username])},
              ${_.findIndex(data.groups, ['groupName', transaction.groupName])},
              ${_.findIndex(data.tokens, ['token', transaction.token])},
              CAST(N'${transaction.timestamp}' AS DateTime),
              ${transaction.oldSaldo},
              ${transaction.newSaldo}
            )`
          )
          .join(',')
          .value(),
        ';SET IDENTITY_INSERT transactions OFF;'
      ], ' ')
    ));
};
