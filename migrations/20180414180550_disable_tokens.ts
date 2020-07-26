import Knex from 'knex';

export const up = (knex: Knex) => {
  return knex.schema.alterTable('tokens', (t) => {
    t.boolean('active').defaultTo(true);
  });
};

export const down = (knex: Knex) => {
  return knex.schema.alterTable('tokens', (t) => {
    t.dropColumn('active');
  });
};
