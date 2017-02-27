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
            .defaultTo(knex.raw('GETDATE()'));
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
            .inTable('users');
        table.integer('group_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('groups');
        table.timestamp('timestamp')
            .defaultTo(knex.raw('GETDATE()'));
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
            .notNullable()
            .unique();
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
    }),

    knex.schema.createTable('tokens', table => {
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

    knex.schema.createTable('token_group_access', (table) => {
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

    })
]);

exports.down = (knex, Promise) => Promise.all([
    knex.schema.dropTable('user_saldos'),
    knex.schema.dropTable('transactions'),
    knex.schema.dropTable('token_group_access'),
    knex.schema.dropTable('users'),
    knex.schema.dropTable('groups'),
    knex.schema.dropTable('tokens')
]);
