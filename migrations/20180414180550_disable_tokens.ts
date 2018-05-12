import Knex from 'knex';

export const up = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.alterTable('tokens', (t) => {
    t.boolean('active')
      .defaultTo(true);
  });
};

export const down = (knex: Knex, Promise: PromiseConstructor) => {
  return knex.schema.alterTable('tokens', (t) => {
    t.dropColumn('active');
  });
};
