exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.raw('ALTER TABLE transactions ALTER COLUMN new_saldo decimal(8,2) not null;'),
    knex.schema.raw('ALTER TABLE transactions ALTER COLUMN old_saldo decimal(8,2) not null;'),
    knex.schema.raw('ALTER TABLE user_saldos ALTER COLUMN saldo decimal(8,2) not null;'),
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.raw('ALTER TABLE transactions ALTER COLUMN new_saldo decimal(18,0) not null;'),
    knex.schema.raw('ALTER TABLE transactions ALTER COLUMN old_saldo decimal(18,0) not null;'),
    knex.schema.raw('ALTER TABLE user_saldos ALTER COLUMN saldo decimal(18,0) not null;'),
  ]);
};
