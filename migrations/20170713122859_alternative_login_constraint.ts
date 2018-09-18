import Knex from 'knex';

export const up = (knex: Knex) => {
  return knex.schema.alterTable('alternative_login', (t) =>
    t.unique(['group_id', 'hashed_key']),
  );

};

export const down = (knex: Knex) => {
  return knex.schema.alterTable('alternative_login', (t) =>
    t.dropUnique(['group_id', 'hashed_key']),
  );
};
