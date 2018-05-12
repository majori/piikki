import Knex from 'knex';

export const up = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.alterTable('groups', (t) => {
    t.boolean('private')
      .defaultTo(false);
  });
};

export const down = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.alterTable('groups', (t) => {
    t.dropColumn('private');
  });
};
