import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.schema.alterTable('alternative_login', (t) =>
    t.unique(['group_id', 'hashed_key']),
  );
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('alternative_login', (t) =>
    t.dropUnique(['group_id', 'hashed_key']),
  );
}
