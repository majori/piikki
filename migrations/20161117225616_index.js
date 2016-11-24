
exports.up = (knex, Promise) => Promise.all([
    knex.schema.createTable('users', table => {
        table.uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('username', 20)
            .unique();
        table.string('password');
        table.float('saldo')
            .defaultTo(0);
    }),


    knex.schema.createTable('transactionTypes', table => {
        table.increments('id')
            .primary();
        table.string('typename');
    }),

    knex.schema.createTable('transactions', table => {
        table.increments('id')
            .primary();
        table.integer('typeId')
            .unsigned()
            .references('id')
            .inTable('transactionTypes')
            .onDelete('SET NULL');
        table.uuid('userId')
            .references('id')
            .inTable('users')
            .onDelete('SET NULL');
        table.timestamp('timestamp')
            .defaultTo(knex.raw('now()'));
        table.float('oldSaldo');
        table.float('newSaldo');
        table.string('comment');
    })
]);

exports.down = (knex, Promise) => Promise.all([
    knex.schema.dropTable('transactions'),
    knex.schema.dropTable('users'),
    knex.schema.dropTable('transactionTypes')
]);
