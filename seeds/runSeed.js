const bcrypt = require('bcrypt');
const crypto = require('crypto');
const _ = require('lodash');

module.exports = (knex, Promise, data) => {

  // Deletes ALL existing entries
  return knex('token_group_access').del()
    .then(() => knex('alternative_login').del())
    .then(() => knex('transactions').del())
    .then(() => knex('user_saldos').del())
    .then(() => knex('tokens').del())
    .then(() => knex('users').del())
    .then(() => knex('groups').del())

    // GROUPS
    .then(() => knex.raw(_.join(
      [
        'INSERT INTO groups(id, name) VALUES ',
        _.chain(data.groups)
          .map((group, i) =>
            `(${i}, '${group.groupName}')`
          )
          .join(',')
          .value() + ';',
        `ALTER SEQUENCE groups_id_seq RESTART WITH ${data.groups.length};`
      ], ' ')
    ))

    // USERS
    .then(() => knex.raw(_.join(
      [
        'INSERT INTO users(id, username, password, default_group) VALUES',
        _.chain(data.users)
          .map((user, i) =>
            `(
              ${i},
              '${user.username}',
              '${bcrypt.hashSync(user.password, 6)}',
              ${user.defaultGroup ? _.findIndex(data.groups, ['groupName', user.defaultGroup]) : null}
            )`
          )
          .join(',')
          .value() + ';',
        `ALTER SEQUENCE users_id_seq RESTART WITH ${data.users.length};`
      ], ' ')
    ))

    // USER SALDOS
    .then(() => knex.raw(_.join(
      [
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
          .value() + ';',
        `ALTER SEQUENCE user_saldos_id_seq RESTART WITH ${data.userSaldos.length};`
      ], ' ')
    ))

    // TOKENS
    .then(() => knex.raw(_.join(
      [
        'INSERT INTO tokens(id, token, role, comment) VALUES ',
        _.chain(data.tokens)
          .map((token, i) => `(${i},'${token.token}','${token.role}','${token.comment}')`)
          .join(',')
          .value() + ';',
          `ALTER SEQUENCE tokens_id_seq RESTART WITH ${data.tokens.length};`
      ], ' ')
    ))

    // TOKEN GROUP ACCESS
    .then(() => knex.raw(_.join(
      [
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
          .value() + ';',
        `ALTER SEQUENCE token_group_access_id_seq RESTART WITH ${data.tokenGroupAccess.length};`
      ], ' ')
    ))

    // TRANSACTIONS
    .then(() => knex.raw(_.join(
      [
        'INSERT INTO transactions (id, user_id, group_id, token_id, timestamp, old_saldo, new_saldo) VALUES ',
        _.chain(data.transactions)
          .map((transaction, i) =>
            `(
              ${i},
              ${_.findIndex(data.users, ['username', transaction.username])},
              ${_.findIndex(data.groups, ['groupName', transaction.groupName])},
              ${_.findIndex(data.tokens, ['token', transaction.token])},
              '${transaction.timestamp}',
              ${transaction.oldSaldo},
              ${transaction.newSaldo}
            )`
          )
          .join(',')
          .value() + ';',
        `ALTER SEQUENCE transactions_id_seq RESTART WITH ${data.transactions.length};`
      ], ' ')
    ))

  .then(() => knex.raw(_.join(
    [
      'INSERT INTO alternative_login (id, user_id, group_id, token_id, type, hashed_key) VALUES ',
      _.chain(data.alternativeLogins)
        .map((login, i) =>
          `(
            ${i},
            ${_.findIndex(data.users, ['username', login.username])},
            ${_.findIndex(data.groups, ['groupName', login.groupName])},
            ${_.findIndex(data.tokens, ['token', login.token])},
            ${login.type},
            '${crypto.createHash('sha256').update(login.key).digest('hex')}'
          )`
        )
        .join(',')
        .value() + ';',
      `ALTER SEQUENCE alternative_login_id_seq RESTART WITH ${data.alternativeLogins.length};`
    ], ' ')
  ));
};
