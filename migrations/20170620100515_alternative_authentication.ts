import Knex from 'knex';

export const up = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.createTable('alternative_login', (table) => {
    table.increments('id')
      .primary();
    table.integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users');
    table.integer('token_id')
      .notNullable()
      .references('id')
      .inTable('tokens');
    table.integer('group_id')
      .nullable()
      .references('id')
      .inTable('groups');
    table.integer('type')
      .nullable();
    table.string('hashed_key')
      .notNullable();
    table.timestamp('created_at')
      .defaultTo(knex.fn.now());
  });
};

export const down = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.dropTable('alternative_login');
};
