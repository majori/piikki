import Knex from 'knex';

export const up = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.alterTable('groups', (t) => {
    t.string('password')
      .notNullable()
      .defaultTo('0000');
  });
};

export const down = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.alterTable('groups', (t) => {
    t.dropColumn('password');
  });
};
