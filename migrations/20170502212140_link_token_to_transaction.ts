import Knex from 'knex';

export const up = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.alterTable('transactions', (t) => {
    t.integer('token_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tokens');
  });
};

export const down = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.alterTable('transactions', (t) => {
    t.dropForeign(['token_id']);
  });
};
