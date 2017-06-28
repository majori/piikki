exports.up = function(knex, Promise) {
  const timestampFunc = (knex.client.config.client === 'mssql') ?
    'GETDATE()' :
    'NOW()';

  return knex.schema.createTableIfNotExists('alternative_login', table => {
    table.increments('id')
      .primary();
    table.integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users');
    table.integer('token_id')
      .notNullable()
      .references('id')
      .inTable('tokens');
    table.integer('group_id')
      .notNullable()
      .references('id')
      .inTable('groups');
    table.integer('type')
      .nullable();
    table.string('hashed_key')
      .notNullable();
    table.timestamp('created_at')
      .defaultTo(knex.raw(timestampFunc));
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('alternative_login');
};
