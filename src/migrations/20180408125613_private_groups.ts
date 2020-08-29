import * as Knex from 'knex';

export async function up(knex: Knex) {
  await knex.schema.alterTable('groups', (t) => {
    t.boolean('private').defaultTo(false);
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('groups', (t) => {
    t.dropColumn('private');
  });
}
