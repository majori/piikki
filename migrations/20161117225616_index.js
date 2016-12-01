
exports.up = (knex, Promise) => Promise.all([

    knex.schema.createTable('users', table => {
        table.increments('id')
            .primary();
        table.string('username', 20)
            .notNullable()
            .unique();
        table.string('password')
            .notNullable();
        table.timestamp('timestamp')
            .defaultTo(knex.raw('now()'));
        table.boolean('active')
            .notNullable()
            .defaultTo(true);
    }),

    knex.schema.createTable('transactions', table => {
        table.increments('id')
            .primary();
        table.integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('RESTRICT');
        table.timestamp('timestamp')
            .defaultTo(knex.raw('now()'));
        table.float('old_saldo')
            .notNullable();
        table.float('new_saldo')
            .notNullable();
        table.string('comment')
            .nullable();
    }),

    knex.schema.createTable('groups', table => {
        table.increments('id')
            .primary();
        table.string('name')
            .notNullable();
    }),

    knex.schema.createTable('user_saldos', table => {
        table.increments('id')
            .primary();
        table.integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users');
        table.integer('group_id')
            .notNullable()
            .references('id')
            .inTable('groups');
        table.float('saldo')
            .notNullable()
            .defaultTo(0);
    })
]);

exports.down = (knex, Promise) => Promise.all([
    knex.schema.dropTable('user_saldos'),
    knex.schema.dropTable('transactions'),
    knex.schema.dropTable('users'),
    knex.schema.dropTable('groups')
]);
