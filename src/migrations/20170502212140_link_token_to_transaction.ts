import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.schema.alterTable('transactions', (t) => {
    t.integer('token_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('tokens');
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('transactions', (t) => {
    t.dropForeign(['token_id']);
  });
}
