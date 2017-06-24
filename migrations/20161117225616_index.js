exports.up = (knex, Promise) => {

    // Use GETDATE() when in mssql, in postgresql use NOW()
    const timestampFunc = (knex.client.config.client === 'mssql') ?
        'GETDATE()' :
        'NOW()';

    return Promise.all([
        knex.schema.createTableIfNotExists('users', table => {
            table.increments('id')
                .primary();
            table.string('username', 20)
                .notNullable()
                .unique();
            table.string('password')
                .notNullable();
            table.timestamp('timestamp')
                .defaultTo(knex.raw(timestampFunc));
            table.boolean('active')
                .notNullable()
                .defaultTo(true);
        }),

        knex.schema.createTableIfNotExists('groups', table => {
            table.increments('id')
                .primary();
            table.string('name')
                .notNullable()
                .unique();
        }),

        knex.schema.createTableIfNotExists('tokens', table => {
            table.increments('id')
                .primary();
            table.string('token')
                .notNullable()
                .unique();
            table.enu('role', ['restricted', 'global', 'admin'])
                .notNullable()
                .defaultTo('restricted');
            table.string('comment');
        }),

        knex.schema.createTableIfNotExists('user_saldos', table => {
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
            table.decimal('saldo', 8, 2)
                .notNullable()
                .defaultTo(0);
        }),

        knex.schema.createTableIfNotExists('transactions', table => {
            table.increments('id')
                .primary();
            table.integer('user_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('users');
            table.integer('group_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('groups');
            table.timestamp('timestamp')
                .defaultTo(knex.raw(timestampFunc));
            table.decimal('old_saldo', 8, 2)
                .notNullable();
            table.decimal('new_saldo', 8, 2)
                .notNullable();
            table.string('comment')
                .nullable();
        }),

        knex.schema.createTableIfNotExists('token_group_access', (table) => {
            table.increments('id')
                .primary();
            table.integer('token_id')
                .notNullable()
                .references('id')
                .inTable('tokens')
                .onDelete('CASCADE');
            table.integer('group_id')
                .notNullable()
                .references('id')
                .inTable('groups');
        }),
    ]);
};

exports.down = (knex, Promise) => Promise.all([
    knex.schema.dropTableIfExists('user_saldos'),
    knex.schema.dropTableIfExists('transactions'),
    knex.schema.dropTableIfExists('token_group_access'),
    knex.schema.dropTableIfExists('users'),
    knex.schema.dropTableIfExists('groups'),
    knex.schema.dropTableIfExists('tokens')
]);
