import Knex from 'knex';

export const up = (knex: Knex) => {
  return knex.schema.alterTable('users', (t) => {
    t.dropColumn('active');
  });
};

export const down = (knex: Knex) => {
  return knex.schema.alterTable('users', (t) => {
    t.boolean('active')
      .notNullable()
      .defaultTo(true);
  });
};
