exports.up = (knex, Promise) => {
  return knex.schema.alterTable('transactions', (t) => {
    t.integer('token_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tokens');
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('transactions', (t) => {
    t.dropForeign('token_id');
  });
};
