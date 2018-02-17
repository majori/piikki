exports.up = (knex, Promise) => {
  return knex.schema.createTable('users', table => {
        table.increments('id')
            .primary();
        table.string('username', 20)
            .notNullable()
            .unique();
        table.string('password')
            .notNullable();
        table.timestamp('timestamp')
            .defaultTo(knex.fn.now());
        table.boolean('active')
            .notNullable()
            .defaultTo(true);
    })
    .then(() => knex.schema.createTable('groups', table => {
        table.increments('id')
            .primary();
        table.string('name')
            .notNullable()
            .unique();
    }))
    .then(() => knex.schema.createTable('tokens', table => {
        table.increments('id')
            .primary();
        table.string('token')
            .notNullable()
            .unique();
        table.enu('role', ['restricted', 'global', 'admin'])
            .notNullable()
            .defaultTo('restricted');
        table.string('comment');
    }))
    .then(() => knex.schema.createTable('user_saldos', table => {
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
    }))
    .then(() => knex.schema.createTable('transactions', table => {
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
            .defaultTo(knex.fn.now());
        table.decimal('old_saldo', 8, 2)
            .notNullable();
        table.decimal('new_saldo', 8, 2)
            .notNullable();
        table.string('comment')
            .nullable();
    })
    .then(() => knex.schema.createTable('token_group_access', (table) => {
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
    }))
  );
};

exports.down = (knex, Promise) => knex.schema.dropTableIfExists('user_saldos')
    .then(() => knex.schema.dropTableIfExists('transactions'))
    .then(() => knex.schema.dropTableIfExists('token_group_access'))
    .then(() => knex.schema.dropTableIfExists('users'))
    .then(() => knex.schema.dropTableIfExists('groups'))
    .then(() => knex.schema.dropTableIfExists('tokens'));
