exports.up = (knex, Promise) => {
  return knex.schema.alterTable('users', (t) => {
    t.dropColumn('active');
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('users', (t) => {
    t.boolean('active')
      .notNullable()
      .defaultTo(true);
  });
};
