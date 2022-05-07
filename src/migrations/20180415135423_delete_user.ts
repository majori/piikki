import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('active');
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('users', (t) => {
    t.boolean('active').notNullable().defaultTo(true);
  });
}
