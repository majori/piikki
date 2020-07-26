import Knex from 'knex';

export const up = (knex: Knex) => {
  return knex.schema.alterTable('groups', (t) => {
    t.boolean('private').defaultTo(false);
  });
};

export const down = (knex: Knex) => {
  return knex.schema.alterTable('groups', (t) => {
    t.dropColumn('private');
  });
};
