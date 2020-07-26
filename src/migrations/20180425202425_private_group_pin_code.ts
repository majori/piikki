import * as Knex from 'knex';

export async function up(knex: Knex) {
  await knex.schema.alterTable('groups', (t) => {
    t.string('password').notNullable().defaultTo('0000');
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('groups', (t) => {
    t.dropColumn('password');
  });
}
