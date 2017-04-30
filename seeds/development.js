const bcrypt = require('bcrypt');

exports.seed = (knex, Promise) => {
  // Deletes ALL existing entries
  return knex('token_group_access').del()
    .then(() => knex('tokens').del())
    .then(() => knex('user_saldos').del())
    .then(() => knex('transactions').del())
    .then(() => knex('users').del())
    .then(() => knex('groups').del())

    // USERS
    .then(() => knex.raw(
      "SET IDENTITY_INSERT users ON;" +
      "INSERT INTO users(id, username, password) VALUES " +
      `(1,'testUser1','${bcrypt.hashSync('1234', 6)}'),` +
      `(2,'testUser2','${bcrypt.hashSync('4321', 6)}'),` +
      `(3,'testUser3','${bcrypt.hashSync('1243', 6)}'),` +
      `(4,'testUser4','${bcrypt.hashSync('4312', 6)}');` +
      "SET IDENTITY_INSERT users OFF;"
    ))

    // GROUPS
    .then(() => knex.raw(
      "SET IDENTITY_INSERT groups ON;" +
      "INSERT INTO groups(id, name) VALUES " +
      "(1,'group1')," +
      "(2,'group2');" +
      "SET IDENTITY_INSERT groups OFF;"
    ))

    // TRANSACTIONS
    .then(() => knex.raw(
      "SET IDENTITY_INSERT transactions ON;" +
      "INSERT INTO transactions"+
      "(id, user_id, group_id, old_saldo, new_saldo) VALUES " +
      "(1,1,1,0,10)," +
      "(2,2,1,0,-10)," +
      "(3,3,1,0,5)," +
      "(4,3,2,0,-5);" +
      "SET IDENTITY_INSERT transactions OFF;"
    ))

    // USER SALDOS
    .then(() => knex.raw(
      "SET IDENTITY_INSERT user_saldos ON;" +
      "INSERT INTO user_saldos(id, user_id, group_id, saldo) VALUES " +
      "(1,1,1,10)," +
      "(2,2,1,-10)," +
      "(3,3,1,5)," +
      "(4,3,2,-5);" +
      "SET IDENTITY_INSERT user_saldos OFF;"
    ))

    // TOKENS
    .then(() => knex.raw(
      "SET IDENTITY_INSERT tokens ON;" +
      "INSERT INTO tokens(id, token, role, comment) VALUES " +
      "(1,'restricted_token','restricted','For restricted')," +
      "(2,'global_token','global','For global')," +
      "(3,'admin_token','admin','For admin');" +
      "SET IDENTITY_INSERT tokens OFF;"
    ))

    // TOKEN GROUP ACCESS
    .then(() => knex.raw(
      "SET IDENTITY_INSERT token_group_access ON;" +
      "INSERT INTO token_group_access(id, token_id, group_id) VALUES " +
      "(1,1,1);" +
      "SET IDENTITY_INSERT token_group_access OFF;"
    ));
};
