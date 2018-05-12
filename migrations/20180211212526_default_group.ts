import Knex from 'knex';

export const up = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.alterTable('users', (t) => {
    t.integer('default_group')
      .references('id')
      .inTable('groups')
      .nullable();
  });
};

export const down = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.alterTable('users', (t) => {
    t.dropForeign(['default_group']);
  });
};
