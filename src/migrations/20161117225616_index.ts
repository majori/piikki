import * as Knex from 'knex';

export async function up(knex: Knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 20).notNullable().unique();
    table.string('password').notNullable();
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    table.boolean('active').notNullable().defaultTo(true);
  });

  await knex.schema.createTable('groups', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
  }),
    await knex.schema.createTable('tokens', (table) => {
      table.increments('id').primary();
      table.string('token').notNullable().unique();
      table
        .enu('role', ['restricted', 'global', 'admin'])
        .notNullable()
        .defaultTo('restricted');
      table.string('comment');
    });

  await knex.schema.createTable('user_saldos', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users');
    table.integer('group_id').notNullable().references('id').inTable('groups');
    table.float('saldo').notNullable().defaultTo(0);
  });
  await knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users');
    table
      .integer('group_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('groups');
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    table.float('old_saldo').notNullable();
    table.float('new_saldo').notNullable();
    table.string('comment').nullable();
  });

  await knex.schema.createTable('token_group_access', (table) => {
    table.increments('id').primary();
    table
      .integer('token_id')
      .notNullable()
      .references('id')
      .inTable('tokens')
      .onDelete('CASCADE');
    table.integer('group_id').notNullable().references('id').inTable('groups');
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTable('user_saldos');
  await knex.schema.dropTable('transactions');
  await knex.schema.dropTable('token_group_access');
  await knex.schema.dropTable('users');
  await knex.schema.dropTable('groups');
  await knex.schema.dropTable('tokens');
}
