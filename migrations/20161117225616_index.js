
exports.up = (knex, Promise) => Promise.all([

    knex.schema.createTable('users', table => {
        table.increments('id')
            .primary();
        table.string('username', 20)
            .notNullable()
            .unique();
        table.string('password')
            .notNullable();
        table.float('saldo')
            .notNullable()
            .defaultTo(0);
        table.timestamp('timestamp')
            .defaultTo(knex.raw('now()'));
        table.boolean('deleted')
            .notNullable()
            .defaultTo(false);
    }),

    knex.schema.createTable('transactions', table => {
        table.increments('id')
            .primary();
        table.integer('userId')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('RESTRICT');
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
