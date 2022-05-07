import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.schema.alterTable('users', (t) => {
    t.integer('default_group').references('id').inTable('groups').nullable();
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('users', (t) => {
    t.dropForeign(['default_group']);
  });
}
