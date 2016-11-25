
exports.up = (knex, Promise) => Promise.all([
    
    // This extension is required for auto-generated uuid (Postgresql)
    knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'),

    knex.schema.createTable('users', table => {
        table.uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('username', 20)
            .notNullable()
            .unique();
        table.string('password')
            .notNullable();
        table.float('saldo')
            .notNullable()
            .defaultTo(0);
        table.boolean('deleted')
            .notNullable()
            .defaultTo(false);
    }),

    knex.schema.createTable('transactions', table => {
        table.increments('id')
            .primary();
        table.uuid('userId')
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('SET NULL');
        table.timestamp('timestamp')
            .defaultTo(knex.raw('now()'));
        table.float('oldSaldo')
            .notNullable();
        table.float('newSaldo')
            .notNullable();
        table.string('comment')
            .nullable();
    })
]);

exports.down = (knex, Promise) => Promise.all([
    knex.schema.dropTable('transactions'),
    knex.schema.dropTable('users')
]);
