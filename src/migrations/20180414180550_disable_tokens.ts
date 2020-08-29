import * as Knex from 'knex';

export async function up(knex: Knex) {
  await knex.schema.alterTable('tokens', (t) => {
    t.boolean('active').defaultTo(true);
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('tokens', (t) => {
    t.dropColumn('active');
  });
}
