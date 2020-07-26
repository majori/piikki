import Knex from 'knex';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as _ from 'lodash';

import { SeedData } from './data/seed';

export default async (knex: Knex, data: SeedData) => {
  // Deletes ALL existing entries
  await knex('token_group_access').del();
  await knex('alternative_login').del();
  await knex('transactions').del();
  await knex('user_saldos').del();
  await knex('tokens').del();
  await knex('users').del();
  await knex('groups').del();

  // GROUPS
  await knex.raw(`
    INSERT INTO groups(id, name, private, password) VALUES
    ${_.chain(data.groups)
      .map(
        (group, i) =>
          `(${i}, '${group.groupName}', ${group.private}, ${
            group.password || '1234'
          })`,
      )
      .join(',')
      .value()};
    ALTER SEQUENCE groups_id_seq RESTART WITH ${data.groups.length};`);

  // USERS
  await knex.raw(`
    INSERT INTO users(id, username, password, default_group) VALUES
    ${_.chain(data.users)
      .map(
        (user, i) =>
          `(
            ${i},
            '${user.username}',
            '${bcrypt.hashSync(user.password, 6)}',
            ${
              user.defaultGroup
                ? _.findIndex(data.groups, ['groupName', user.defaultGroup])
                : null
            }
          )`,
      )
      .join(',')
      .value()};
    ALTER SEQUENCE users_id_seq RESTART WITH ${data.users.length};`);

  // USER SALDOS
  await knex.raw(`
    INSERT INTO user_saldos(id, user_id, group_id, saldo) VALUES
    ${_.chain(data.userSaldos)
      .map(
        (saldo, i) =>
          `(
            ${i},
            ${_.findIndex(data.users, ['username', saldo.username])},
            ${_.findIndex(data.groups, ['groupName', saldo.groupName])},
            ${saldo.saldo}
          )`,
      )
      .join(',')
      .value()};
    ALTER SEQUENCE user_saldos_id_seq RESTART WITH ${data.userSaldos.length};`);

  // TOKENS
  await knex.raw(`
    INSERT INTO tokens(id, token, role, comment) VALUES
    ${_.chain(data.tokens)
      .map(
        (token, i) =>
          `(${i},'${token.token}','${token.role}','${token.comment}')`,
      )
      .join(',')
      .value()};
    ALTER SEQUENCE tokens_id_seq RESTART WITH ${data.tokens.length};`);

  // TOKEN GROUP ACCESS
  await knex.raw(`
    INSERT INTO token_group_access(id, token_id, group_id) VALUES
    ${_.chain(data.tokenGroupAccess)
      .map(
        (access, i) =>
          `(
            ${i},
            ${_.findIndex(data.tokens, ['token', access.token])},
            ${_.findIndex(data.groups, ['groupName', access.groupName])}
          )`,
      )
      .join(',')
      .value()};
    ALTER SEQUENCE token_group_access_id_seq RESTART WITH ${
      data.tokenGroupAccess.length
    };`);

  // TRANSACTIONS
  await knex.raw(`
    INSERT INTO transactions (id, user_id, group_id, token_id, timestamp, old_saldo, new_saldo) VALUES
    ${_.chain(data.transactions)
      .map(
        (transaction, i) =>
          `(
            ${i},
            ${_.findIndex(data.users, ['username', transaction.username])},
            ${_.findIndex(data.groups, ['groupName', transaction.groupName])},
            ${_.findIndex(data.tokens, ['token', transaction.token])},
            '${transaction.timestamp}',
            ${transaction.oldSaldo},
            ${transaction.newSaldo}
          )`,
      )
      .join(',')
      .value()};
    ALTER SEQUENCE transactions_id_seq RESTART WITH ${
      data.transactions.length
    };`);

  await knex.raw(`
    INSERT INTO alternative_login (id, user_id, group_id, token_id, type, hashed_key) VALUES
    ${_.chain(data.alternativeLogins)
      .map(
        (login, i) =>
          `(
            ${i},
            ${_.findIndex(data.users, ['username', login.username])},
            ${_.findIndex(data.groups, ['groupName', login.groupName])},
            ${_.findIndex(data.tokens, ['token', login.token])},
            ${login.type},
            '${crypto.createHash('sha256').update(login.key).digest('hex')}'
          )`,
      )
      .join(',')
      .value()};
    ALTER SEQUENCE alternative_login_id_seq RESTART WITH ${
      data.alternativeLogins.length
    };`);
};
